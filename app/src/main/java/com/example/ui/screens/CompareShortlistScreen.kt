package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Plot
import com.example.ui.components.PlotStatusBadge
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

@Composable
fun CompareShortlistScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val shortlistedIds by viewModel.shortlistedPlotIds.collectAsState()
    val compareIds by viewModel.comparePlotIds.collectAsState()
    val plotsMap by viewModel.plotsMap.collectAsState()

    val allPlots = plotsMap.values.flatten()
    val shortlistedPlots = allPlots.filter { shortlistedIds.contains(it.id) }
    val comparePlots = allPlots.filter { compareIds.contains(it.id) }

    var selectedTab by remember { mutableIntStateOf(0) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(PlotSurfaceLight),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        // Header
        item {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Text(
                    text = "BUYER TOOLS",
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotGreenPrimary,
                    letterSpacing = 1.sp
                )
                Text(
                    text = "Saved Shortlist & Plot Comparison",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PlotNavyDark
                )
                Text(
                    text = "Compare dimensions, orientation, pricing and title records side-by-side.",
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )
            }
        }

        // Tab Selector
        item {
            TabRow(
                selectedTabIndex = selectedTab,
                containerColor = PlotWhite,
                contentColor = PlotGreenPrimary
            ) {
                Tab(
                    selected = selectedTab == 0,
                    onClick = { selectedTab = 0 },
                    text = { Text("Compare Matrix (${comparePlots.size})", fontWeight = FontWeight.Bold) }
                )
                Tab(
                    selected = selectedTab == 1,
                    onClick = { selectedTab = 1 },
                    text = { Text("Saved Shortlist (${shortlistedPlots.size})", fontWeight = FontWeight.Bold) }
                )
            }
        }

        if (selectedTab == 0) {
            // Comparison Matrix
            if (comparePlots.isEmpty()) {
                item {
                    EmptyToolState(
                        title = "No Plots in Comparison",
                        desc = "Click the compare icon (⇄) on any plot in 3D View or 2D Layout to add up to 4 plots here.",
                        btnText = "Explore Plots",
                        onAction = { viewModel.navigateTo(AppDestination.PROJECT_DETAIL) }
                    )
                }
            } else {
                item {
                    LazyRow(
                        horizontalArrangement = Arrangement.spacedBy(12.dp),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        items(comparePlots) { plot ->
                            PlotComparisonColumn(
                                plot = plot,
                                onRemove = { viewModel.toggleCompare(plot.id) },
                                onBookVisit = { viewModel.openSiteVisitDialog(plot.id) }
                            )
                        }
                    }
                }
            }
        } else {
            // Shortlist List
            if (shortlistedPlots.isEmpty()) {
                item {
                    EmptyToolState(
                        title = "Your Shortlist is Empty",
                        desc = "Tap the heart icon (♥) on any plot to save it for quick reference and family sharing.",
                        btnText = "Explore Plots",
                        onAction = { viewModel.navigateTo(AppDestination.MARKETPLACE) }
                    )
                }
            } else {
                items(shortlistedPlots) { plot ->
                    Card(
                        shape = RoundedCornerShape(10.dp),
                        colors = CardDefaults.cardColors(containerColor = PlotWhite),
                        border = BorderStroke(1.dp, PlotCardBorder),
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Row(
                            modifier = Modifier.padding(14.dp),
                            horizontalArrangement = Arrangement.SpaceBetween,
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                                ) {
                                    Text(text = "Plot ${plot.plotNumber}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                                    PlotStatusBadge(status = plot.status)
                                }
                                Text(
                                    text = "${plot.sizeSqFt} sq.ft (${plot.dimensions}) • ${plot.facing} • ${plot.roadWidth}",
                                    fontSize = 12.sp,
                                    color = PlotTextSecondary
                                )
                                Text(
                                    text = plot.formattedPrice,
                                    fontSize = 15.sp,
                                    fontWeight = FontWeight.Bold,
                                    color = PlotGreenPrimary
                                )
                            }

                            Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                Button(
                                    onClick = { viewModel.openSiteVisitDialog(plot.id) },
                                    colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                                    shape = RoundedCornerShape(8.dp)
                                ) {
                                    Text("Book Visit", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                                }

                                IconButton(onClick = { viewModel.toggleShortlist(plot.id) }) {
                                    Icon(Icons.Default.DeleteOutline, contentDescription = "Remove", tint = PlotRed)
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun PlotComparisonColumn(
    plot: Plot,
    onRemove: () -> Unit,
    onBookVisit: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = Modifier.width(220.dp)
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "Plot ${plot.plotNumber}", fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                IconButton(onClick = onRemove, modifier = Modifier.size(24.dp)) {
                    Icon(Icons.Default.Close, contentDescription = "Remove", tint = PlotTextMuted)
                }
            }

            PlotStatusBadge(status = plot.status)

            Divider(color = PlotCardBorder)

            CompItem("Area", "${plot.sizeSqFt} sq.ft")
            CompItem("Dimensions", plot.dimensions)
            CompItem("Facing", "${plot.facing} Facing")
            CompItem("Road Width", plot.roadWidth)
            CompItem("Rate / sq.ft", "₹${plot.pricePerSqFt.toInt()}")
            CompItem("Total Price", plot.formattedPrice, isHighlight = true)
            CompItem("Title Status", "✓ 30-Yr Clear")

            Spacer(modifier = Modifier.height(4.dp))

            Button(
                onClick = onBookVisit,
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text("Book Site Visit", fontSize = 11.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}

@Composable
private fun CompItem(label: String, value: String, isHighlight: Boolean = false) {
    Column {
        Text(text = label, fontSize = 10.sp, color = PlotTextMuted)
        Text(
            text = value,
            fontSize = 12.sp,
            fontWeight = if (isHighlight) FontWeight.ExtraBold else FontWeight.Medium,
            color = if (isHighlight) PlotGreenPrimary else PlotNavyDark
        )
    }
}

@Composable
private fun EmptyToolState(
    title: String,
    desc: String,
    btnText: String,
    onAction: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Icon(Icons.Default.Inbox, contentDescription = null, tint = PlotTextMuted, modifier = Modifier.size(40.dp))
            Text(text = title, fontSize = 16.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
            Text(text = desc, fontSize = 12.sp, color = PlotTextSecondary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            Button(
                onClick = onAction,
                colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                shape = RoundedCornerShape(8.dp)
            ) {
                Text(btnText, fontSize = 12.sp, fontWeight = FontWeight.Bold)
            }
        }
    }
}
