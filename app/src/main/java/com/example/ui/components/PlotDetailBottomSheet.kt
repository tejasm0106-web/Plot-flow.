package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.Plot
import com.example.ui.theme.*

@Composable
fun PlotDetailFloatingSheet(
    plot: Plot,
    isShortlisted: Boolean,
    isCompared: Boolean,
    onToggleShortlist: () -> Unit,
    onToggleCompare: () -> Unit,
    onBookSiteVisit: () -> Unit,
    onCheckGenuinity: () -> Unit,
    onOpen3DPreview: () -> Unit,
    onClose: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .padding(horizontal = 12.dp, vertical = 8.dp),
        shape = RoundedCornerShape(20.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp),
        border = BorderStroke(1.5.dp, PlotGreenPrimary.copy(alpha = 0.3f))
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "Plot ${plot.plotNumber}",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    PlotStatusBadge(status = plot.status)
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(
                        onClick = onToggleShortlist,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = if (isShortlisted) Icons.Default.Favorite else Icons.Default.FavoriteBorder,
                            contentDescription = "Shortlist",
                            tint = if (isShortlisted) PlotRed else PlotNavyDark
                        )
                    }
                    IconButton(
                        onClick = onToggleCompare,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.CompareArrows,
                            contentDescription = "Compare",
                            tint = if (isCompared) PlotGreenPrimary else PlotNavyDark
                        )
                    }
                    IconButton(
                        onClick = onClose,
                        modifier = Modifier.size(36.dp)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Close",
                            tint = PlotTextMuted
                        )
                    }
                }
            }

            // Specs Row
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "Area", fontSize = 11.sp, color = PlotTextMuted)
                    Text(
                        text = "${plot.sizeSqFt} sq.ft",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    Text(text = plot.dimensions, fontSize = 11.sp, color = PlotTextSecondary)
                }

                Column(modifier = Modifier.weight(1f)) {
                    Text(text = "Orientation", fontSize = 11.sp, color = PlotTextMuted)
                    Text(
                        text = "${plot.facing} Facing",
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    Text(text = plot.roadWidth, fontSize = 11.sp, color = PlotTextSecondary)
                }

                Column(modifier = Modifier.weight(1.2f)) {
                    Text(text = "Total Price", fontSize = 11.sp, color = PlotTextMuted)
                    Text(
                        text = plot.formattedPrice,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotGreenPrimary
                    )
                    Text(text = "₹${plot.pricePerSqFt.toInt()}/sq.ft", fontSize = 11.sp, color = PlotTextSecondary)
                }
            }

            // Action Buttons
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onCheckGenuinity,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("action_check_genuinity"),
                    colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.VerifiedUser,
                        contentDescription = null,
                        tint = PlotGreenLight,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Verify Evidence", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                Button(
                    onClick = onBookSiteVisit,
                    modifier = Modifier
                        .weight(1f)
                        .testTag("action_book_site_visit"),
                    colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.CalendarToday,
                        contentDescription = null,
                        tint = Color.White,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Book Visit", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onOpen3DPreview,
                    modifier = Modifier.size(44.dp),
                    shape = RoundedCornerShape(10.dp),
                    contentPadding = PaddingValues(0.dp),
                    border = BorderStroke(1.dp, PlotNavyLight)
                ) {
                    Icon(
                        imageVector = Icons.Default.ViewInAr,
                        contentDescription = "3D Villa Preview",
                        tint = PlotNavyDark
                    )
                }
            }
        }
    }
}
