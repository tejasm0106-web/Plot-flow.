package com.example.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.animateColorAsState
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.foundation.*
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.gestures.rememberTransformableState
import androidx.compose.foundation.gestures.transformable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.draw.shadow
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Fill
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.R
import com.example.model.Plot
import com.example.model.PlotStatus
import com.example.ui.theme.*

@Composable
fun InteractivePlotMasterCanvas(
    plots: List<Plot>,
    selectedPlotId: String?,
    onPlotSelected: (Plot) -> Unit,
    activeLayer: String = "All",
    modifier: Modifier = Modifier
) {
    var scale by remember { mutableFloatStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }

    val transformState = rememberTransformableState { zoomChange, offsetChange, _ ->
        scale = (scale * zoomChange).coerceIn(0.8f, 2.5f)
        offset += offsetChange
    }

    Box(
        modifier = modifier
            .fillMaxWidth()
            .height(340.dp)
            .clip(RoundedCornerShape(16.dp))
            .background(PlotNavyDark)
            .border(1.dp, PlotNavyLight, RoundedCornerShape(16.dp))
            .transformable(state = transformState)
    ) {
        // Masterplan 3D Architectural Base
        Image(
            painter = painterResource(id = R.drawable.img_3d_project_master),
            contentDescription = "3D Plotted Masterplan",
            modifier = Modifier.fillMaxSize(),
            contentScale = ContentScale.Crop
        )

        // Semi-transparent depth overlay
        Box(
            modifier = Modifier
                .fillMaxSize()
                .background(
                    Brush.verticalGradient(
                        colors = listOf(
                            Color.Black.copy(alpha = 0.25f),
                            Color.Black.copy(alpha = 0.55f)
                        )
                    )
                )
        )

        // Interactive Canvas Layer with touchable plot boundary grids
        Canvas(
            modifier = Modifier
                .fillMaxSize()
                .pointerInput(plots, selectedPlotId) {
                    detectTapGestures { tapOffset ->
                        val width = size.width
                        val height = size.height
                        val startX = width * 0.08f
                        val startY = height * 0.18f
                        val plotW = (width * 0.84f) / 6f
                        val plotH = (height * 0.60f) / 4f

                        for (plot in plots) {
                            val r = plot.gridRow
                            val c = plot.gridCol
                            val x = startX + c * plotW
                            val y = startY + r * plotH

                            if (tapOffset.x in x..(x + plotW) && tapOffset.y in y..(y + plotH)) {
                                onPlotSelected(plot)
                                break
                            }
                        }
                    }
                }
        ) {
            val canvasW = size.width
            val canvasH = size.height

            val startX = canvasW * 0.08f
            val startY = canvasH * 0.18f
            val plotW = (canvasW * 0.84f) / 6f
            val plotH = (canvasH * 0.60f) / 4f

            // Draw Road Network
            if (activeLayer == "All" || activeLayer == "Roads") {
                // Main 40ft Boulevard between row 1 and 2
                drawRect(
                    color = Color(0xFF334155).copy(alpha = 0.85f),
                    topLeft = Offset(0f, startY + 2 * plotH - 6.dp.toPx()),
                    size = Size(canvasW, 12.dp.toPx())
                )
                // Center line
                drawLine(
                    color = Color(0xFFFACC15).copy(alpha = 0.7f),
                    start = Offset(0f, startY + 2 * plotH),
                    end = Offset(canvasW, startY + 2 * plotH),
                    strokeWidth = 2.dp.toPx()
                )
            }

            // Draw Central Park feature in middle
            if (activeLayer == "All" || activeLayer == "Greenery") {
                val parkX = startX + 2 * plotW
                val parkY = startY + 1 * plotH
                drawRoundRect(
                    color = Color(0xFF059669).copy(alpha = 0.35f),
                    topLeft = Offset(parkX + 4.dp.toPx(), parkY + 4.dp.toPx()),
                    size = Size(2 * plotW - 8.dp.toPx(), plotH - 8.dp.toPx()),
                    cornerRadius = androidx.compose.ui.geometry.CornerRadius(8.dp.toPx(), 8.dp.toPx())
                )
            }

            // Draw individual Plots
            if (activeLayer == "All" || activeLayer == "Plots") {
                for (plot in plots) {
                    val r = plot.gridRow
                    val c = plot.gridCol
                    val x = startX + c * plotW + 3.dp.toPx()
                    val y = startY + r * plotH + 3.dp.toPx()
                    val w = plotW - 6.dp.toPx()
                    val h = plotH - 6.dp.toPx()

                    val isSelected = plot.id == selectedPlotId

                    val fillColor = when {
                        isSelected -> Color(0xFFF59E0B).copy(alpha = 0.75f) // Gold
                        plot.status == PlotStatus.AVAILABLE -> Color(0xFF10B981).copy(alpha = 0.50f) // Green
                        plot.status == PlotStatus.RESERVED -> Color(0xFFF59E0B).copy(alpha = 0.40f) // Amber
                        plot.status == PlotStatus.SOLD -> Color(0xFFEF4444).copy(alpha = 0.50f) // Red
                        else -> Color.White.copy(alpha = 0.3f)
                    }

                    val borderColor = when {
                        isSelected -> Color(0xFFFDE047)
                        plot.status == PlotStatus.AVAILABLE -> Color(0xFF34D399)
                        plot.status == PlotStatus.RESERVED -> Color(0xFFFBBF24)
                        plot.status == PlotStatus.SOLD -> Color(0xFFF87171)
                        else -> Color.White
                    }

                    drawRoundRect(
                        color = fillColor,
                        topLeft = Offset(x, y),
                        size = Size(w, h),
                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(4.dp.toPx(), 4.dp.toPx()),
                        style = Fill
                    )

                    drawRoundRect(
                        color = borderColor,
                        topLeft = Offset(x, y),
                        size = Size(w, h),
                        cornerRadius = androidx.compose.ui.geometry.CornerRadius(4.dp.toPx(), 4.dp.toPx()),
                        style = Stroke(width = if (isSelected) 3.dp.toPx() else 1.2.dp.toPx())
                    )
                }
            }
        }

        // Floating Masterplan Controls
        Row(
            modifier = Modifier
                .align(Alignment.TopStart)
                .padding(12.dp),
            horizontalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            Surface(
                color = PlotNavyDark.copy(alpha = 0.85f),
                shape = RoundedCornerShape(20.dp),
                border = BorderStroke(1.dp, PlotNavyLight)
            ) {
                Row(
                    modifier = Modifier.padding(horizontal = 10.dp, vertical = 6.dp),
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.ViewInAr,
                        contentDescription = "3D Interactive",
                        tint = PlotGreenLight,
                        modifier = Modifier.size(16.dp)
                    )
                    Text(
                        text = "3D Digital Twin",
                        color = Color.White,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold
                    )
                }
            }

            Surface(
                color = Color.Black.copy(alpha = 0.65f),
                shape = RoundedCornerShape(20.dp)
            ) {
                Text(
                    text = "Tap any plot to inspect",
                    color = Color.White.copy(alpha = 0.9f),
                    fontSize = 11.sp,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp)
                )
            }
        }

        // Legend overlay at bottom
        Surface(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .padding(bottom = 8.dp),
            color = PlotNavyDark.copy(alpha = 0.9f),
            shape = RoundedCornerShape(16.dp),
            border = BorderStroke(1.dp, PlotNavyLight)
        ) {
            Row(
                modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp),
                horizontalArrangement = Arrangement.spacedBy(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                LegendItem(color = PlotGreenLight, label = "Available")
                LegendItem(color = PlotGold, label = "Reserved")
                LegendItem(color = PlotRed, label = "Sold")
                LegendItem(color = Color(0xFFFDE047), label = "Selected", isRing = true)
            }
        }

        // Zoom controls
        Column(
            modifier = Modifier
                .align(Alignment.TopEnd)
                .padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(6.dp)
        ) {
            FloatingActionButton(
                onClick = { scale = (scale + 0.2f).coerceAtMost(2.5f) },
                modifier = Modifier.size(36.dp),
                containerColor = PlotNavyCard,
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Add, contentDescription = "Zoom In", modifier = Modifier.size(18.dp))
            }
            FloatingActionButton(
                onClick = { scale = (scale - 0.2f).coerceAtLeast(0.8f) },
                modifier = Modifier.size(36.dp),
                containerColor = PlotNavyCard,
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Remove, contentDescription = "Zoom Out", modifier = Modifier.size(18.dp))
            }
            FloatingActionButton(
                onClick = { scale = 1f; offset = Offset.Zero },
                modifier = Modifier.size(36.dp),
                containerColor = PlotNavyCard,
                contentColor = Color.White,
                shape = CircleShape
            ) {
                Icon(Icons.Default.Refresh, contentDescription = "Reset View", modifier = Modifier.size(18.dp))
            }
        }
    }
}

@Composable
private fun LegendItem(color: Color, label: String, isRing: Boolean = false) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(5.dp)
    ) {
        Box(
            modifier = Modifier
                .size(10.dp)
                .clip(CircleShape)
                .background(color)
                .then(
                    if (isRing) Modifier.border(1.5.dp, Color.White, CircleShape) else Modifier
                )
        )
        Text(text = label, color = Color.White, fontSize = 11.sp, fontWeight = FontWeight.Medium)
    }
}

@Composable
fun PlotGrid2DView(
    plots: List<Plot>,
    selectedPlotId: String?,
    onPlotSelected: (Plot) -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier
            .fillMaxWidth()
            .clip(RoundedCornerShape(16.dp))
            .background(PlotSurfaceLight)
            .border(1.dp, PlotCardBorder, RoundedCornerShape(16.dp))
            .padding(14.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column {
                Text(
                    text = "2D Interactive Plot Layout",
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    color = PlotNavyDark
                )
                Text(
                    text = "Showing 24 demarcated survey plots • Tap to inspect details",
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )
            }
        }

        Spacer(modifier = Modifier.height(12.dp))

        LazyVerticalGrid(
            columns = GridCells.Fixed(4),
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier
                .fillMaxWidth()
                .height(320.dp)
        ) {
            items(plots) { plot ->
                val isSelected = plot.id == selectedPlotId
                val (cardBg, borderColor, textColor) = when {
                    isSelected -> Triple(PlotGoldLight, PlotGold, Color(0xFF92400E))
                    plot.status == PlotStatus.AVAILABLE -> Triple(PlotGreenSoft, PlotGreenLight, PlotGreenDark)
                    plot.status == PlotStatus.RESERVED -> Triple(PlotGoldLight.copy(alpha = 0.6f), PlotGold, Color(0xFFB45309))
                    plot.status == PlotStatus.SOLD -> Triple(PlotRedLight, PlotRed, Color(0xFF991B1B))
                    else -> Triple(PlotSurfaceLight, PlotCardBorder, PlotNavyDark)
                }

                Surface(
                    onClick = { onPlotSelected(plot) },
                    shape = RoundedCornerShape(10.dp),
                    color = cardBg,
                    border = BorderStroke(if (isSelected) 2.dp else 1.dp, borderColor),
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("plot_card_${plot.plotNumber}")
                ) {
                    Column(
                        modifier = Modifier.padding(8.dp),
                        horizontalAlignment = Alignment.CenterHorizontally
                    ) {
                        Text(
                            text = plot.plotNumber,
                            fontSize = 14.sp,
                            fontWeight = FontWeight.Bold,
                            color = textColor
                        )
                        Text(
                            text = "${plot.sizeSqFt} sq.ft",
                            fontSize = 10.sp,
                            color = textColor.copy(alpha = 0.9f),
                            fontWeight = FontWeight.Medium
                        )
                        Spacer(modifier = Modifier.height(4.dp))
                        Text(
                            text = plot.facing,
                            fontSize = 9.sp,
                            color = PlotNavyDark,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = plot.status.displayName,
                            fontSize = 9.sp,
                            color = textColor,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }
        }
    }
}

@Composable
fun PlotSpecific3DPreviewCard(
    plot: Plot,
    onBookSiteVisit: () -> Unit,
    onCheckGenuinity: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = PlotNavyDark),
        border = BorderStroke(1.dp, PlotNavyLight)
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            Box(
                modifier = Modifier
                    .fillMaxWidth()
                    .height(200.dp)
            ) {
                Image(
                    painter = painterResource(id = R.drawable.img_plot_villa_preview),
                    contentDescription = "Plot ${plot.plotNumber} 3D Villa Concept",
                    modifier = Modifier.fillMaxSize(),
                    contentScale = ContentScale.Crop
                )

                // Gradient overlay
                Box(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(
                            Brush.verticalGradient(
                                colors = listOf(
                                    Color.Black.copy(alpha = 0.1f),
                                    PlotNavyDark.copy(alpha = 0.85f)
                                )
                            )
                        )
                )

                // Plot tag
                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = PlotGold,
                    modifier = Modifier
                        .align(Alignment.TopStart)
                        .padding(12.dp)
                ) {
                    Text(
                        text = "Plot ${plot.plotNumber} — 3D Visualizer",
                        color = PlotNavyDark,
                        fontWeight = FontWeight.Bold,
                        fontSize = 12.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }

                // Mandatory conceptual disclaimer pill
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = Color.Black.copy(alpha = 0.75f),
                    modifier = Modifier
                        .align(Alignment.BottomStart)
                        .padding(12.dp)
                ) {
                    Text(
                        text = "⚠ Conceptual visualization — actual villa design may vary",
                        color = Color(0xFFFDE047),
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
            }

            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Plot ${plot.plotNumber} Specifications",
                            fontSize = 16.sp,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = "${plot.dimensions} • ${plot.facing} Facing • ${plot.roadWidth}",
                            fontSize = 12.sp,
                            color = Color(0xFF94A3B8)
                        )
                    }
                    PlotStatusBadge(status = plot.status)
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    SpecPill(label = "Plot Area", value = "${plot.sizeSqFt} sq.ft", modifier = Modifier.weight(1f))
                    SpecPill(label = "Price / sq.ft", value = "₹${plot.pricePerSqFt.toInt()}", modifier = Modifier.weight(1f))
                    SpecPill(label = "Total Outlay", value = plot.formattedPrice, modifier = Modifier.weight(1.2f))
                }

                if (plot.notes.isNotEmpty()) {
                    Text(
                        text = "Feature: ${plot.notes}",
                        fontSize = 12.sp,
                        color = PlotGreenLight,
                        fontWeight = FontWeight.Medium
                    )
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Button(
                        onClick = onCheckGenuinity,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("check_genuinity_btn"),
                        colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.VerifiedUser, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Check Genuinity", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }

                    OutlinedButton(
                        onClick = onBookSiteVisit,
                        modifier = Modifier
                            .weight(1f)
                            .testTag("book_site_visit_btn"),
                        colors = ButtonDefaults.outlinedButtonColors(contentColor = Color.White),
                        border = BorderStroke(1.dp, PlotGreenLight),
                        shape = RoundedCornerShape(10.dp)
                    ) {
                        Icon(Icons.Default.CalendarMonth, contentDescription = null, modifier = Modifier.size(16.dp))
                        Spacer(modifier = Modifier.width(6.dp))
                        Text("Book Site Visit", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}

@Composable
private fun SpecPill(label: String, value: String, modifier: Modifier = Modifier) {
    Surface(
        shape = RoundedCornerShape(8.dp),
        color = PlotNavyCard,
        border = BorderStroke(1.dp, PlotNavyLight),
        modifier = modifier
    ) {
        Column(
            modifier = Modifier.padding(horizontal = 8.dp, vertical = 6.dp),
            horizontalAlignment = Alignment.CenterHorizontally
        ) {
            Text(text = label, fontSize = 10.sp, color = Color(0xFF94A3B8))
            Text(text = value, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
        }
    }
}
