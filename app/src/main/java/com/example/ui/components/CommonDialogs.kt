package com.example.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
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
import androidx.compose.ui.window.Dialog
import com.example.model.DocCategory
import com.example.ui.theme.*

@Composable
fun BookSiteVisitDialog(
    projectName: String,
    plotNumber: String,
    onDismiss: () -> Unit,
    onConfirm: (name: String, phone: String, date: String, timeSlot: String, visitors: Int, needPickup: Boolean, address: String) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var selectedDate by remember { mutableStateOf("Saturday, 29 Aug 2026") }
    var selectedTime by remember { mutableStateOf("11:00 AM - 12:30 PM") }
    var visitorsCount by remember { mutableIntStateOf(2) }
    var needPickup by remember { mutableStateOf(false) }
    var pickupAddress by remember { mutableStateOf("") }

    val dateOptions = listOf("Saturday, 29 Aug 2026", "Sunday, 30 Aug 2026", "Monday, 31 Aug 2026", "Tuesday, 01 Sep 2026")
    val timeOptions = listOf("10:00 AM - 11:30 AM", "11:00 AM - 12:30 PM", "02:30 PM - 04:00 PM", "04:30 PM - 06:00 PM")

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PlotWhite)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(
                            text = "Book Guided Site Visit",
                            fontSize = 18.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotNavyDark
                        )
                        Text(
                            text = "$projectName • Plot $plotNumber",
                            fontSize = 12.sp,
                            color = PlotGreenDark,
                            fontWeight = FontWeight.SemiBold
                        )
                    }
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Your Full Name") },
                    leadingIcon = { Icon(Icons.Default.Person, contentDescription = null) },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("visit_name_input")
                )

                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Mobile Number (for gate pass & updates)") },
                    leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null) },
                    singleLine = true,
                    modifier = Modifier
                        .fillMaxWidth()
                        .testTag("visit_phone_input")
                )

                Text(text = "Select Preferred Date", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                Column(verticalArrangement = Arrangement.spacedBy(6.dp)) {
                    dateOptions.forEach { date ->
                        Surface(
                            onClick = { selectedDate = date },
                            shape = RoundedCornerShape(8.dp),
                            color = if (selectedDate == date) PlotGreenSoft else PlotSurfaceLight,
                            border = BorderStroke(1.dp, if (selectedDate == date) PlotGreenPrimary else PlotCardBorder),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(selected = selectedDate == date, onClick = { selectedDate = date })
                                Spacer(modifier = Modifier.width(6.dp))
                                Text(text = date, fontSize = 13.sp, color = PlotNavyDark)
                            }
                        }
                    }
                }

                Text(text = "Select Time Slot", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    timeOptions.take(2).forEach { slot ->
                        Surface(
                            onClick = { selectedTime = slot },
                            shape = RoundedCornerShape(8.dp),
                            color = if (selectedTime == slot) PlotGreenSoft else PlotSurfaceLight,
                            border = BorderStroke(1.dp, if (selectedTime == slot) PlotGreenPrimary else PlotCardBorder),
                            modifier = Modifier.weight(1f)
                        ) {
                            Text(
                                text = slot,
                                fontSize = 11.sp,
                                fontWeight = FontWeight.Medium,
                                color = PlotNavyDark,
                                modifier = Modifier.padding(8.dp)
                            )
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(text = "Number of Visitors", fontSize = 13.sp, color = PlotNavyDark)
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        IconButton(
                            onClick = { if (visitorsCount > 1) visitorsCount-- },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.RemoveCircleOutline, contentDescription = "Decrease")
                        }
                        Text(text = "$visitorsCount", fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        IconButton(
                            onClick = { if (visitorsCount < 8) visitorsCount++ },
                            modifier = Modifier.size(32.dp)
                        ) {
                            Icon(Icons.Default.AddCircleOutline, contentDescription = "Increase")
                        }
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Text(text = "Need Complimentary Airport/Metro Pickup?", fontSize = 12.sp, fontWeight = FontWeight.SemiBold)
                        Text(text = "Dedicated AC car from nearby hubs", fontSize = 10.sp, color = PlotTextSecondary)
                    }
                    Switch(checked = needPickup, onCheckedChange = { needPickup = it })
                }

                if (needPickup) {
                    OutlinedTextField(
                        value = pickupAddress,
                        onValueChange = { pickupAddress = it },
                        label = { Text("Pickup Location / Landmark") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }

                Button(
                    onClick = {
                        val finalName = name.ifBlank { "Prospective Buyer" }
                        val finalPhone = phone.ifBlank { "+91 98450 00000" }
                        onConfirm(finalName, finalPhone, selectedDate, selectedTime, visitorsCount, needPickup, pickupAddress)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp)
                        .testTag("confirm_site_visit_btn"),
                    colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Confirm Site Visit", fontWeight = FontWeight.Bold, fontSize = 14.sp)
                }
            }
        }
    }
}

@Composable
fun DocumentUploadDialog(
    onDismiss: () -> Unit,
    onUpload: (category: DocCategory, title: String, fileName: String, sourceUrl: String?) -> Unit
) {
    var selectedCategory by remember { mutableStateOf(DocCategory.MOTHER_DEED) }
    var title by remember { mutableStateOf("") }
    var fileName by remember { mutableStateOf("Document_Scan_2026.pdf") }
    var sourceUrl by remember { mutableStateOf("https://landrecords.karnataka.gov.in/verify") }
    var expanded by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PlotWhite)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Upload Property Document",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Text(text = "Select Document Category", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                Box {
                    OutlinedButton(
                        onClick = { expanded = true },
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp)
                    ) {
                        Text(text = selectedCategory.displayName, color = PlotNavyDark)
                        Spacer(modifier = Modifier.weight(1f))
                        Icon(Icons.Default.ArrowDropDown, contentDescription = null)
                    }
                    DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
                        DocCategory.values().forEach { cat ->
                            DropdownMenuItem(
                                text = { Text(cat.displayName) },
                                onClick = {
                                    selectedCategory = cat
                                    expanded = false
                                }
                            )
                        }
                    }
                }

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Document Title (e.g. 30-Year Title Search)") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = fileName,
                    onValueChange = { fileName = it },
                    label = { Text("Selected File (PDF, JPG, PNG)") },
                    trailingIcon = { Icon(Icons.Default.AttachFile, contentDescription = null) },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = sourceUrl,
                    onValueChange = { sourceUrl = it },
                    label = { Text("Official Verification Portal URL (Optional)") },
                    modifier = Modifier.fillMaxWidth()
                )

                Surface(
                    shape = RoundedCornerShape(8.dp),
                    color = PlotSurfaceLight,
                    border = BorderStroke(1.dp, PlotCardBorder),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Text(
                        text = "ℹ All uploaded documents undergo strict platform legal review before being marked 'Verified'.",
                        fontSize = 11.sp,
                        color = PlotTextSecondary,
                        modifier = Modifier.padding(10.dp)
                    )
                }

                Button(
                    onClick = {
                        val finalTitle = title.ifBlank { selectedCategory.displayName }
                        onUpload(selectedCategory, finalTitle, fileName, sourceUrl)
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.CloudUpload, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Submit for Evidence Review", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun AddGovernmentSourceDialog(
    onDismiss: () -> Unit,
    onSave: (title: String, portalName: String, url: String, authorityName: String) -> Unit
) {
    var title by remember { mutableStateOf("Bhoomi RTC Land Record") }
    var portalName by remember { mutableStateOf("Karnataka Bhoomi Revenue Portal") }
    var url by remember { mutableStateOf("https://landrecords.karnataka.gov.in/service2/RTC.aspx") }
    var authorityName by remember { mutableStateOf("Devanahalli Sub-Registrar / Taluk Office") }

    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PlotWhite)
        ) {
            Column(
                modifier = Modifier
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState()),
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Add Official Government Source",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("Source Title") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = portalName,
                    onValueChange = { portalName = it },
                    label = { Text("Government / Portal Name") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = url,
                    onValueChange = { url = it },
                    label = { Text("Official Public URL") },
                    modifier = Modifier.fillMaxWidth()
                )

                OutlinedTextField(
                    value = authorityName,
                    onValueChange = { authorityName = it },
                    label = { Text("Issuing Authority / Jurisdiction") },
                    modifier = Modifier.fillMaxWidth()
                )

                Button(
                    onClick = { onSave(title, portalName, url, authorityName) },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.Link, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Save Official Source", fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}

@Composable
fun ShareProjectDialog(
    projectName: String,
    location: String,
    onDismiss: () -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(8.dp),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(containerColor = PlotWhite)
        ) {
            Column(
                modifier = Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(14.dp)
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Share Project",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                Surface(
                    shape = RoundedCornerShape(10.dp),
                    color = Color(0xFFF1F5F9),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(modifier = Modifier.padding(12.dp)) {
                        Text(
                            text = "$projectName — Verified Plotted Development",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotNavyDark
                        )
                        Text(
                            text = "📍 $location • BMRDA Approved • Live 3D Layout & Evidence on PlotFlow",
                            fontSize = 12.sp,
                            color = PlotTextSecondary
                        )
                        Spacer(modifier = Modifier.height(6.dp))
                        Text(
                            text = "https://plotflow.in/project/green-valley-enclave",
                            fontSize = 11.sp,
                            color = PlotBlueAccent,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }

                Button(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF25D366)),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.Share, contentDescription = null, tint = Color.White)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Share on WhatsApp", color = Color.White, fontWeight = FontWeight.Bold)
                }

                OutlinedButton(
                    onClick = onDismiss,
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp)
                ) {
                    Icon(Icons.Default.ContentCopy, contentDescription = null)
                    Spacer(modifier = Modifier.width(8.dp))
                    Text("Copy Shareable Link")
                }
            }
        }
    }
}
