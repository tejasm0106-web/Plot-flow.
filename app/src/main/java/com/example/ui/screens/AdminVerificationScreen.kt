package com.example.ui.screens

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
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
import com.example.model.ProjectDocument
import com.example.model.VerificationStatus
import com.example.ui.components.VerificationStatusChip
import com.example.ui.theme.*
import com.example.viewmodel.PlotFlowViewModel

@Composable
fun AdminVerificationScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val projects by viewModel.projects.collectAsState()
    val uiState by viewModel.uiState.collectAsState()

    val currentProject = projects.find { it.id == uiState.selectedProjectId } ?: projects.firstOrNull() ?: return

    var auditNotes by remember { mutableStateOf("") }

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
                    color = PlotNavyDark
                ) {
                    Text(
                        text = "INTERNAL AUDIT & COMPLIANCE",
                        color = PlotGold,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                    )
                }
                Text(
                    text = "Platform Verification Queue",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PlotNavyDark
                )
                Text(
                    text = "Empanelled legal team audit panel for approving/rejecting property deeds & government links.",
                    fontSize = 12.sp,
                    color = PlotTextSecondary
                )
            }
        }

        // Project Status Overview
        item {
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
                    Text(text = "Reviewing Project: ${currentProject.name}", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                    Text(text = "Developer: ${currentProject.developer.companyName} • Trust Score: ${currentProject.developer.trustScore}/100", fontSize = 12.sp, color = PlotGreenDark, fontWeight = FontWeight.SemiBold)
                    Text(text = "Approval Status: ${currentProject.approvalAuthority}", fontSize = 12.sp, color = PlotNavyDark)

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = {
                                viewModel.showNotification("Project compliance audit updated to 100% verified.")
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Mark 100% Verified", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = {
                                viewModel.showNotification("Project compliance flagged for re-audit.")
                            },
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Mark Under Review", fontSize = 11.sp)
                        }
                    }
                }
            }
        }

        // Document Queue
        item {
            Text(
                text = "Submitted Documents Verification Queue (${currentProject.documents.size})",
                fontSize = 15.sp,
                fontWeight = FontWeight.Bold,
                color = PlotNavyDark
            )
        }

        items(currentProject.documents) { doc ->
            Card(
                shape = RoundedCornerShape(10.dp),
                colors = CardDefaults.cardColors(containerColor = PlotWhite),
                border = BorderStroke(1.dp, PlotCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(12.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(text = doc.title, fontWeight = FontWeight.Bold, fontSize = 13.sp, color = PlotNavyDark, modifier = Modifier.weight(1f))
                        VerificationStatusChip(status = doc.status)
                    }

                    Text(text = "File: ${doc.fileName} • Category: ${doc.category.displayName}", fontSize = 11.sp, color = PlotTextSecondary)
                    Text(text = "Uploaded by: ${doc.uploadedBy} on ${doc.uploadedDate}", fontSize = 10.sp, color = PlotTextMuted)

                    if (doc.notes != null) {
                        Text(text = "Current Note: ${doc.notes}", fontSize = 11.sp, color = PlotBlueAccent)
                    }

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(6.dp)
                    ) {
                        Button(
                            onClick = {
                                viewModel.approveDocument(doc.id, "Verified against Sub-Registrar records by PlotFlow Legal Panel")
                            },
                            colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Check, contentDescription = null, modifier = Modifier.size(14.dp))
                            Spacer(modifier = Modifier.width(4.dp))
                            Text("Approve Document", fontSize = 10.sp, fontWeight = FontWeight.Bold)
                        }

                        OutlinedButton(
                            onClick = {
                                viewModel.rejectDocument(doc.id, "Clarification requested on survey boundary discrepancy")
                            },
                            shape = RoundedCornerShape(6.dp),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text("Flag / Request Edit", fontSize = 10.sp)
                        }
                    }
                }
            }
        }
    }
}
