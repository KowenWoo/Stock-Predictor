import torch
import torch.nn as nn
from config import config

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch.nn.utils import weight_norm

class ResidualBlock(nn.Module):
    def __init__(self, in_channels, out_channels, kernel_size, dilation, dropout):
        super(ResidualBlock, self).__init__()

        # Padding ensures output has the same length as input
        padding = (kernel_size - 1) * dilation

        # First causal convolution
        self.conv1 = weight_norm(nn.Conv1d(in_channels, out_channels, kernel_size,
                                           padding=padding, dilation=dilation))
        self.relu1 = nn.ReLU()
        self.dropout1 = nn.Dropout(dropout)

        # Second causal convolution
        self.conv2 = weight_norm(nn.Conv1d(out_channels, out_channels, kernel_size,
                                           padding=padding, dilation=dilation))
        self.relu2 = nn.ReLU()
        self.dropout2 = nn.Dropout(dropout)

        # 1x1 Conv for residual connection if dimensions mismatch
        self.downsample = nn.Conv1d(in_channels, out_channels, 1) if in_channels != out_channels else None
        self.relu_out = nn.ReLU()

    def forward(self, x):
        # Store residual
        residual = x  

        # First convolution block
        x = self.conv1(x)
        x = self.relu1(x)
        x = self.dropout1(x)

        # Second convolution block
        x = self.conv2(x)
        x = self.relu2(x)
        x = self.dropout2(x)

        # Match dimensions if needed
        if self.downsample is not None:
            residual = self.downsample(residual)

        return self.relu_out(x + residual)  # Skip connection + ReLU

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