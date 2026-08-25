package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
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
import com.example.model.Lead
import com.example.model.LeadStage
import com.example.ui.theme.*
import com.example.viewmodel.PlotFlowViewModel

@OptIn(ExperimentalLayoutApi::class)
@Composable
fun LeadCrmScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val leads by viewModel.leads.collectAsState()
    var selectedStageFilter by remember { mutableStateOf<LeadStage?>(null) }
    var searchQuery by remember { mutableStateOf("") }

    val filteredLeads = leads.filter { lead ->
        val matchesStage = selectedStageFilter == null || lead.stage == selectedStageFilter
        val matchesSearch = searchQuery.isBlank() ||
                lead.name.contains(searchQuery, ignoreCase = true) ||
                lead.interestedPlotNumber.contains(searchQuery, ignoreCase = true) ||
                lead.phone.contains(searchQuery, ignoreCase = true)
        matchesStage && matchesSearch
    }

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
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = PlotGreenSoft
                ) {
                    Text(
                        text = "PLOTFLOW CRM",
                        color = PlotGreenDark,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Text(
                    text = "Lead Management & Sales Pipeline",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PlotNavyDark
                )
                Text(
                    text = "Track high-intent buyers, automated WhatsApp follow-ups, and scheduled site visits.",
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )
            }
        }

        // Pipeline Stages Scrollable Row
        item {
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.fillMaxWidth()
            ) {
                item {
                    FilterChip(
                        selected = selectedStageFilter == null,
                        onClick = { selectedStageFilter = null },
                        label = { Text("All Leads (${leads.size})", fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PlotNavyDark,
                            selectedLabelColor = Color.White
                        )
                    )
                }
                items(LeadStage.values()) { stage ->
                    val count = leads.count { it.stage == stage }
                    FilterChip(
                        selected = selectedStageFilter == stage,
                        onClick = { selectedStageFilter = stage },
                        label = { Text("${stage.label} ($count)", fontSize = 11.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = PlotGreenSoft,
                            selectedLabelColor = PlotGreenDark
                        )
                    )
                }
            }
        }

        // Search Bar
        item {
            OutlinedTextField(
                value = searchQuery,
                onValueChange = { searchQuery = it },
                placeholder = { Text("Search lead by name, phone, or plot...") },
                leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
                singleLine = true,
                shape = RoundedCornerShape(8.dp),
                modifier = Modifier.fillMaxWidth()
            )
        }

        // Leads List
        items(filteredLeads) { lead ->
            LeadCard(
                lead = lead,
                onUpdateStage = { nextStage ->
                    viewModel.updateLeadStage(lead.id, nextStage)
                },
                onWhatsAppClick = {
                    viewModel.showNotification("Opening WhatsApp chat with ${lead.name} (${lead.phone})")
                },
                onCallClick = {
                    viewModel.showNotification("Calling ${lead.name} at ${lead.phone}")
                }
            )
        }
    }
}

@Composable
private fun LeadCard(
    lead: Lead,
    onUpdateStage: (LeadStage) -> Unit,
    onWhatsAppClick: () -> Unit,
    onCallClick: () -> Unit
) {
    var expandedStageMenu by remember { mutableStateOf(false) }

    Card(
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(containerColor = PlotWhite),
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(text = lead.name, fontSize = 15.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                    Text(text = "${lead.phone} • ${lead.email}", fontSize = 11.sp, color = PlotTextSecondary)
                }

                Box {
                    Surface(
                        onClick = { expandedStageMenu = true },
                        shape = RoundedCornerShape(6.dp),
                        color = when (lead.stage) {
                            LeadStage.NEW -> PlotNavyLight.copy(alpha = 0.2f)
                            LeadStage.CONTACTED -> PlotBlueAccent.copy(alpha = 0.15f)
                            LeadStage.SITE_VISIT -> PlotGreenSoft
                            LeadStage.NEGOTIATION -> PlotGoldLight
                            LeadStage.BOOKING -> PlotGoldLight
                            LeadStage.CLOSED -> PlotGreenPrimary
                        }
                    ) {
                        Row(
                            modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Text(
                                text = lead.stage.label,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (lead.stage == LeadStage.CLOSED) Color.White else PlotNavyDark
                            )
                            Icon(Icons.Default.ArrowDropDown, contentDescription = null, modifier = Modifier.size(16.dp))
                        }
                    }

                    DropdownMenu(
                        expanded = expandedStageMenu,
                        onDismissRequest = { expandedStageMenu = false }
                    ) {
                        LeadStage.values().forEach { stage ->
                            DropdownMenuItem(
                                text = { Text(stage.label) },
                                onClick = {
                                    onUpdateStage(stage)
                                    expandedStageMenu = false
                                }
                            )
                        }
                    }
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = "Target: Plot ${lead.interestedPlotNumber} • Budget: ${lead.budget}",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = PlotGreenDark
                )
                Text(
                    text = "Source: ${lead.source}",
                    fontSize = 11.sp,
                    color = PlotTextMuted
                )
            }

            if (lead.notes.isNotEmpty()) {
                Surface(
                    shape = RoundedCornerShape(6.dp),
                    color = PlotSurfaceLight,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "Notes: ${lead.notes}",
                        fontSize = 11.sp,
                        color = PlotTextSecondary,
                        modifier = Modifier.padding(8.dp)
                    )
                }
            }

            Divider(color = PlotCardBorder)

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Contacted: ${lead.lastContacted}",
                    fontSize = 10.sp,
                    color = PlotTextMuted
                )

                Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                    IconButton(
                        onClick = onWhatsAppClick,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.Chat, contentDescription = "WhatsApp", tint = Color(0xFF25D366))
                    }
                    IconButton(
                        onClick = onCallClick,
                        modifier = Modifier.size(32.dp)
                    ) {
                        Icon(Icons.Default.Phone, contentDescription = "Call", tint = PlotNavyDark)
                    }
                }
            }
        }
    }
}
