package com.example.ui.screens

import androidx.compose.foundation.*
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.PlotStatus
import com.example.ui.components.*
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

@Composable
fun ThreeDViewerScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val projects by viewModel.projects.collectAsState()
    val plotsMap by viewModel.plotsMap.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    val project = projects.find { it.id == uiState.selectedProjectId } ?: projects.firstOrNull()
    if (project == null) {
        Column(
            modifier = modifier
                .fillMaxSize()
                .background(PlotNavyDark)
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Center
        ) {
            Icon(Icons.Default.ViewInAr, contentDescription = null, tint = PlotGold, modifier = Modifier.size(56.dp))
            Spacer(modifier = Modifier.height(16.dp))
            Text("No 3D Digital Twin Available", fontSize = 18.sp, fontWeight = FontWeight.Bold, color = Color.White)
            Spacer(modifier = Modifier.height(8.dp))
            Text("No plotted townships have been published yet. Developers can add real layouts to generate interactive 3D twins.", fontSize = 12.sp, color = Color.White.copy(alpha = 0.7f), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Spacer(modifier = Modifier.height(20.dp))
            Button(
                onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD) },
                colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Add Project (Developer)")
            }
        }
        return
    }
    val plots = plotsMap[project.id] ?: emptyList()
    val selectedPlot = plots.find { it.id == uiState.selectedPlotId }

    var is2DLayoutMode by remember { mutableStateOf(false) }
    var activeLayer by remember { mutableStateOf("All") }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(PlotNavyDark),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Top Bar
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "3D Interactive Digital Twin",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Color.White
                    )
                    Text(
                        text = "${project.name} • ${plots.size} Demarcated Plots",
                        fontSize = 12.sp,
                        color = PlotGreenLight
                    )
                }

                // 2D vs 3D toggle
                Row(
                    modifier = Modifier
                        .background(PlotNavyCard, RoundedCornerShape(8.dp))
                        .padding(4.dp)
                ) {
                    Surface(
                        onClick = { is2DLayoutMode = false },
                        shape = RoundedCornerShape(6.dp),
                        color = if (!is2DLayoutMode) PlotGreenPrimary else Color.Transparent
                    ) {
                        Text(
                            text = "3D View",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                    Surface(
                        onClick = { is2DLayoutMode = true },
                        shape = RoundedCornerShape(6.dp),
                        color = if (is2DLayoutMode) PlotGreenPrimary else Color.Transparent
                    ) {
                        Text(
                            text = "2D Layout",
                            fontSize = 11.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White,
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                        )
                    }
                }
            }
        }

        // Main Viewer Canvas
        item {
            if (is2DLayoutMode) {
                PlotGrid2DView(
                    plots = plots,
                    selectedPlotId = uiState.selectedPlotId,
                    onPlotSelected = { viewModel.selectPlot(it.id) }
                )
            } else {
                InteractivePlotMasterCanvas(
                    plots = plots,
                    selectedPlotId = uiState.selectedPlotId,
                    onPlotSelected = { viewModel.selectPlot(it.id) },
                    activeLayer = activeLayer
                )
            }
        }

        // Plot-specific 3D Villa Concept Card when a plot is selected
        item {
            if (selectedPlot != null) {
                PlotSpecific3DPreviewCard(
                    plot = selectedPlot,
                    onBookSiteVisit = { viewModel.openSiteVisitDialog(selectedPlot.id) },
                    onCheckGenuinity = { viewModel.navigateTo(AppDestination.VERIFICATION_CENTER) }
                )
            } else {
                Card(
                    shape = RoundedCornerShape(12.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotNavyCard),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(16.dp),
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Icon(Icons.Default.TouchApp, contentDescription = null, tint = PlotGold, modifier = Modifier.size(24.dp))
                        Column {
                            Text("Select Any Plot Above", color = Color.White, fontWeight = FontWeight.Bold, fontSize = 14.sp)
                            Text("Click any plot parcel on the masterplan to reveal square footage, facing, pricing, 3D villa preview and title evidence.", color = Color(0xFF94A3B8), fontSize = 12.sp)
                        }
                    }
                }
            }
        }

        // Future 3D Capabilities Section
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = PlotNavyCard),
                border = BorderStroke(1.dp, PlotNavyLight),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "3D Architectural Model Engine",
                        color = PlotGreenLight,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Supports GLTF / GLB / OBJ model rendering, VR walkthroughs, solar shadow simulation and drone point cloud integration.",
                        color = Color(0xFFCBD5E1),
                        fontSize = 12.sp
                    )
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        OutlinedButton(
                            onClick = { viewModel.showNotification("GLTF/GLB Upload pipeline ready for production.") },
                            colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                            border = BorderStroke(1.dp, PlotGreenLight),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Upload 3D Model", fontSize = 11.sp)
                        }
                        Button(
                            onClick = { viewModel.showNotification("Loading 360° virtual drone panorama...") },
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("View in 360°", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }

        // Disclaimer
        item {
            LegalDisclaimerBanner()
        }
    }
}
