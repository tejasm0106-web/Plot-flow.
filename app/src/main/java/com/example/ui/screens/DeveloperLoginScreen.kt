package com.example.ui.screens

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.example.viewmodel.PlotFlowViewModel

@Composable
fun DeveloperLoginScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    AuthScreen(viewModel = viewModel, modifier = modifier)
}
