import torch
import torch.nn as nn
from config import config

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.nn.utils import weight_norm

class CausalConv1d(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, dilation=1):
        super(CausalConv1d, self).__init__()
        self.padding = (kernel_size - 1) * dilation
        self.conv = weight_norm(nn.Conv1d(
            in_channels, out_channels, kernel_size, 
            padding=self.padding, dilation=dilation
        ))
        
    def forward(self, x):
        x = self.conv(x)
        # Remove padding at the end to maintain causality
        x = x[:, :, :-self.padding] if self.padding else x
        return x

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, dilation, dropout):
        super(ResidualBlock, self).__init__()

        # First causal convolution
        self.conv1 = CausalConv1d(in_channels, out_channels, kernel_size, dilation)
        self.relu1 = nn.ReLU()
        self.dropout1 = nn.Dropout(dropout)

        # Second causal convolution
        self.conv2 = CausalConv1d(out_channels, out_channels, kernel_size, dilation)
        self.relu2 = nn.ReLU()
        self.dropout2 = nn.Dropout(dropout)

        # 1x1 Conv for residual connection if dimensions mismatch
        self.downsample = nn.Conv1d(in_channels, out_channels, 1) if in_channels != out_channels else None
        self.relu_out = nn.ReLU()
        
    def forward(self, x):
        # Store residual
        residual = x

        # Apply convolution blocks  
        out = self.conv1(x)
        out = self.relu1(out)
        out = self.dropout1(out)
        
        out = self.conv2(out)
        out = self.relu2(out)
        out = self.dropout2(out)

        # Match dimensions if needed
        if self.downsample is not None:
            residual = self.downsample(residual)
            
        # Adjust residual length if needed
        if residual.size(2) > out.size(2):
            residual = residual[:, :, -out.size(2):]
            
        return self.relu_out(out + residual)

class TCN(nn.Module):
    def __init__(self, input_size, output_size, num_channels, kernel_size, dropout):
        super(TCN, self).__init__()
        
        layers = []
        num_layers = len(num_channels)

        for i in range(num_layers):
            in_channels = input_size if i == 0 else num_channels[i - 1]
            out_channels = num_channels[i]
            dilation = 2 ** i  # Exponential dilation growth
            layers.append(ResidualBlock(in_channels, out_channels, kernel_size, dilation, dropout))

        self.network = nn.Sequential(*layers)
        self.fc = nn.Linear(num_channels[-1], output_size)  # Final output layer

    def forward(self, x):
        x = self.network(x)  # Pass through TCN layers
        x = x[:, :, -1]  # Take last time step's output
        return self.fc(x)