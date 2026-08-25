package com.example.ui.screens

import androidx.compose.animation.*
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalFocusManager
import androidx.compose.ui.platform.testTag
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.text.input.VisualTransformation
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.model.UserRole
import com.example.ui.theme.*
import com.example.viewmodel.AppDestination
import com.example.viewmodel.PlotFlowViewModel

enum class AuthTabMode(val label: String) {
    LOGIN("Sign In"),
    REGISTER("Create Account"),
    ADMIN("Admin Portal")
}

/**
 * AuthScreen Composable providing toggle UI for Login / Registration,
 * User Role specification (Buyer vs. Developer), and Firebase Auth session management.
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AuthScreen(
    viewModel: PlotFlowViewModel,
    modifier: Modifier = Modifier
) {
    val uiState by viewModel.uiState.collectAsState()
    val focusManager = LocalFocusManager.current

    var activeTab by remember { mutableStateOf(AuthTabMode.LOGIN) }
    var selectedRole by remember { mutableStateOf(UserRole.BUYER) }
    var isRoleDropdownExpanded by remember { mutableStateOf(false) }

    // Form states
    var fullNameInput by remember { mutableStateOf("") }
    var companyNameInput by remember { mutableStateOf("") }
    var roleTitleInput by remember { mutableStateOf("Managing Director & Land Developer") }
    var emailInput by remember { mutableStateOf("") }
    var phoneInput by remember { mutableStateOf("") }
    var passwordInput by remember { mutableStateOf("") }
    var confirmPasswordInput by remember { mutableStateOf("") }
    var isPasswordVisible by remember { mutableStateOf(false) }
    var isConfirmPasswordVisible by remember { mutableStateOf(false) }
    var validationError by remember { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = modifier
            .fillMaxSize()
            .background(PlotSurfaceLight)
            .testTag("auth_screen_container"),
        contentPadding = PaddingValues(horizontal = 16.dp, vertical = 20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Active Session Card (If User is already Authenticated)
        if (uiState.currentUser != null) {
            item {
                Card(
                    shape = RoundedCornerShape(16.dp),
                    colors = CardDefaults.cardColors(containerColor = PlotWhite),
                    border = BorderStroke(1.dp, if (uiState.isDeveloperLoggedIn) PlotGold else PlotGreenPrimary),
                    modifier = Modifier.fillMaxWidth().testTag("active_session_card")
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Surface(
                                shape = CircleShape,
                                color = if (uiState.isDeveloperLoggedIn) PlotNavyDark else PlotGreenDark,
                                modifier = Modifier.size(48.dp)
                            ) {
                                Box(contentAlignment = Alignment.Center) {
                                    Icon(
                                        imageVector = if (uiState.isDeveloperLoggedIn) Icons.Default.BusinessCenter else Icons.Default.Person,
                                        contentDescription = null,
                                        tint = if (uiState.isDeveloperLoggedIn) PlotGold else Color.White,
                                        modifier = Modifier.size(24.dp)
                                    )
                                }
                            }

                            Column(modifier = Modifier.weight(1f)) {
                                Row(
                                    verticalAlignment = Alignment.CenterVertically,
                                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                                ) {
                                    Text(
                                        text = uiState.currentUser?.displayName ?: "Authenticated User",
                                        fontWeight = FontWeight.Bold,
                                        fontSize = 15.sp,
                                        color = PlotNavyDark
                                    )
                                    Surface(
                                        shape = RoundedCornerShape(6.dp),
                                        color = if (uiState.isDeveloperLoggedIn) PlotNavyDark else PlotGreenSoft
                                    ) {
                                        Text(
                                            text = if (uiState.isDeveloperLoggedIn) "Developer / Builder" else "Buyer",
                                            fontSize = 9.sp,
                                            fontWeight = FontWeight.Bold,
                                            color = if (uiState.isDeveloperLoggedIn) PlotGold else PlotGreenDark,
                                            modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                        )
                                    }
                                }
                                Text(
                                    text = uiState.currentUser?.email ?: "",
                                    fontSize = 12.sp,
                                    color = PlotTextSecondary
                                )
                                if (uiState.currentUser?.companyName != null) {
                                    Text(
                                        text = "Company: ${uiState.currentUser?.companyName}",
                                        fontSize = 11.sp,
                                        fontWeight = FontWeight.SemiBold,
                                        color = PlotNavyDark
                                    )
                                }
                            }
                        }

                        Divider(color = PlotCardBorder)

                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(10.dp)
                        ) {
                            if (uiState.isDeveloperLoggedIn) {
                                Button(
                                    onClick = { viewModel.navigateTo(AppDestination.DEVELOPER_DASHBOARD) },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = PlotNavyDark),
                                    modifier = Modifier.weight(1f).height(42.dp)
                                ) {
                                    Icon(Icons.Default.Dashboard, contentDescription = null, tint = PlotGold, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Developer SaaS", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                }
                            } else {
                                Button(
                                    onClick = { viewModel.navigateTo(AppDestination.MARKETPLACE) },
                                    shape = RoundedCornerShape(8.dp),
                                    colors = ButtonDefaults.buttonColors(containerColor = PlotGreenPrimary),
                                    modifier = Modifier.weight(1f).height(42.dp)
                                ) {
                                    Icon(Icons.Default.Explore, contentDescription = null, modifier = Modifier.size(16.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text("Explore Layouts", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                                }
                            }

                            OutlinedButton(
                                onClick = { viewModel.logoutUser() },
                                shape = RoundedCornerShape(8.dp),
                                colors = ButtonDefaults.outlinedButtonColors(contentColor = PlotRed),
                                border = BorderStroke(1.dp, PlotRed.copy(alpha = 0.5f)),
                                modifier = Modifier.height(42.dp).testTag("auth_sign_out_btn")
                            ) {
                                Icon(Icons.Default.Logout, contentDescription = null, tint = PlotRed, modifier = Modifier.size(14.dp))
                                Spacer(modifier = Modifier.width(4.dp))
                                Text("Sign Out", fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PlotRed)
                            }
                        }
                    }
                }
            }
        }

        // Header Section
        item {
            Column(
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp),
                modifier = Modifier.padding(top = 4.dp)
            ) {
                Surface(
                    shape = RoundedCornerShape(16.dp),
                    color = if (selectedRole == UserRole.DEVELOPER) PlotNavyDark else PlotGreenDark,
                    modifier = Modifier.size(54.dp)
                ) {
                    Box(contentAlignment = Alignment.Center) {
                        Icon(
                            imageVector = if (selectedRole == UserRole.DEVELOPER) Icons.Default.BusinessCenter else Icons.Default.Apartment,
                            contentDescription = "PlotFlow Auth",
                            tint = if (selectedRole == UserRole.DEVELOPER) PlotGold else Color.White,
                            modifier = Modifier.size(30.dp)
                        )
                    }
                }

                Text(
                    text = if (activeTab == AuthTabMode.LOGIN) "Sign In to PlotFlow" else "Join PlotFlow Platform",
                    fontSize = 22.sp,
                    fontWeight = FontWeight.ExtraBold,
                    color = PlotNavyDark
                )

                Text(
                    text = if (selectedRole == UserRole.DEVELOPER)
                        "Manage 3D plotted inventory, upload masterplans, and engage qualified buyer leads."
                    else
                        "Explore legally verified layouts, inspect high-res digital twins, and book site visits.",
                    fontSize = 12.sp,
                    color = PlotTextSecondary,
                    textAlign = TextAlign.Center,
                    lineHeight = 16.sp,
                    modifier = Modifier.padding(horizontal = 12.dp)
                )
            }
        }

        // Segmented Toggle UI: Login vs. Registration
        item {
            Card(
                shape = RoundedCornerShape(12.dp),
                colors = CardDefaults.cardColors(containerColor = PlotWhite),
                border = BorderStroke(1.dp, PlotCardBorder),
                modifier = Modifier.fillMaxWidth().testTag("auth_mode_toggle")
            ) {
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(4.dp)
                ) {
                    // Login Tab
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (activeTab == AuthTabMode.LOGIN) PlotNavyDark else Color.Transparent,
                        modifier = Modifier
                            .weight(1f)
                            .clickable {
                                activeTab = AuthTabMode.LOGIN
                                validationError = null
                                viewModel.clearNotification()
                            }
                            .testTag("toggle_login_tab")
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.padding(vertical = 10.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    Icons.Default.Login,
                                    contentDescription = null,
                                    tint = if (activeTab == AuthTabMode.LOGIN) Color.White else PlotTextSecondary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "Login",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = if (activeTab == AuthTabMode.LOGIN) Color.White else PlotTextSecondary
                                )
                            }
                        }
                    }

                    // Registration Tab
                    Surface(
                        shape = RoundedCornerShape(8.dp),
                        color = if (activeTab == AuthTabMode.REGISTER) PlotNavyDark else Color.Transparent,
                        modifier = Modifier
                            .weight(1f)
                            .clickable {
                                activeTab = AuthTabMode.REGISTER
                                validationError = null
                                viewModel.clearNotification()
                            }
                            .testTag("toggle_register_tab")
                    ) {
                        Box(
                            contentAlignment = Alignment.Center,
                            modifier = Modifier.padding(vertical = 10.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(6.dp)
                            ) {
                                Icon(
                                    Icons.Default.PersonAdd,
                                    contentDescription = null,
                                    tint = if (activeTab == AuthTabMode.REGISTER) Color.White else PlotTextSecondary,
                                    modifier = Modifier.size(16.dp)
                                )
                                Text(
                                    text = "Register",
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 13.sp,
                                    color = if (activeTab == AuthTabMode.REGISTER) Color.White else PlotTextSecondary
                                )
                            }
                        }
                    }
                }
            }
        }

        // Role Specification Selector: Buyer vs. Developer (Dropdown & Card Selector)
        item {
            Column(verticalArrangement = Arrangement.spacedBy(10.dp)) {
                // Dropdown Selection for Role
                ExposedDropdownMenuBox(
                    expanded = isRoleDropdownExpanded,
                    onExpandedChange = { isRoleDropdownExpanded = !isRoleDropdownExpanded },
                    modifier = Modifier.fillMaxWidth().testTag("role_dropdown_container")
                ) {
                    OutlinedTextField(
                        value = if (selectedRole == UserRole.DEVELOPER) "Developer (Builder SaaS & CRM)" else "Buyer (Township & Plot Explorer)",
                        onValueChange = {},
                        readOnly = true,
                        label = { Text("Select Account Role") },
                        trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = isRoleDropdownExpanded) },
                        leadingIcon = {
                            Icon(
                                imageVector = if (selectedRole == UserRole.DEVELOPER) Icons.Default.BusinessCenter else Icons.Default.Person,
                                contentDescription = null,
                                tint = if (selectedRole == UserRole.DEVELOPER) PlotNavyDark else PlotGreenPrimary
                            )
                        },
                        colors = ExposedDropdownMenuDefaults.outlinedTextFieldColors(
                            focusedContainerColor = PlotWhite,
                            unfocusedContainerColor = PlotWhite
                        ),
                        shape = RoundedCornerShape(10.dp),
                        modifier = Modifier
                            .menuAnchor()
                            .fillMaxWidth()
                            .testTag("role_dropdown_input")
                    )

                    ExposedDropdownMenu(
                        expanded = isRoleDropdownExpanded,
                        onDismissRequest = { isRoleDropdownExpanded = false }
                    ) {
                        DropdownMenuItem(
                            text = {
                                Column {
                                    Text(
                                        text = "Buyer",
                                        fontWeight = FontWeight.Bold,
                                        color = PlotNavyDark
                                    )
                                    Text(
                                        text = "Explore plotted townships, 3D layouts, and book visits",
                                        fontSize = 11.sp,
                                        color = PlotTextSecondary
                                    )
                                }
                            },
                            leadingIcon = {
                                Icon(Icons.Default.Home, contentDescription = null, tint = PlotGreenDark)
                            },
                            onClick = {
                                selectedRole = UserRole.BUYER
                                isRoleDropdownExpanded = false
                                validationError = null
                            },
                            modifier = Modifier.testTag("dropdown_item_buyer")
                        )
                        HorizontalDivider()
                        DropdownMenuItem(
                            text = {
                                Column {
                                    Text(
                                        text = "Developer",
                                        fontWeight = FontWeight.Bold,
                                        color = PlotNavyDark
                                    )
                                    Text(
                                        text = "Manage township inventory, CRM leads, and RERA milestones",
                                        fontSize = 11.sp,
                                        color = PlotTextSecondary
                                    )
                                }
                            },
                            leadingIcon = {
                                Icon(Icons.Default.BusinessCenter, contentDescription = null, tint = PlotGold)
                            },
                            onClick = {
                                selectedRole = UserRole.DEVELOPER
                                isRoleDropdownExpanded = false
                                validationError = null
                            },
                            modifier = Modifier.testTag("dropdown_item_developer")
                        )
                    }
                }

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    // Buyer Role Card
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (selectedRole == UserRole.BUYER) PlotGreenDark else PlotWhite,
                        border = BorderStroke(
                            width = if (selectedRole == UserRole.BUYER) 2.dp else 1.dp,
                            color = if (selectedRole == UserRole.BUYER) PlotGreenPrimary else PlotCardBorder
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .clickable {
                                selectedRole = UserRole.BUYER
                                validationError = null
                            }
                            .testTag("role_buyer_option")
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Home,
                                    contentDescription = null,
                                    tint = if (selectedRole == UserRole.BUYER) Color.White else PlotGreenDark,
                                    modifier = Modifier.size(20.dp)
                                )
                                if (selectedRole == UserRole.BUYER) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = Color.White,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Buyer",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (selectedRole == UserRole.BUYER) Color.White else PlotNavyDark
                            )
                            Text(
                                text = "Explore & Book Visits",
                                fontSize = 10.sp,
                                color = if (selectedRole == UserRole.BUYER) Color.White.copy(alpha = 0.85f) else PlotTextMuted
                            )
                        }
                    }

                    // Developer Role Card
                    Surface(
                        shape = RoundedCornerShape(12.dp),
                        color = if (selectedRole == UserRole.DEVELOPER) PlotNavyDark else PlotWhite,
                        border = BorderStroke(
                            width = if (selectedRole == UserRole.DEVELOPER) 2.dp else 1.dp,
                            color = if (selectedRole == UserRole.DEVELOPER) PlotGold else PlotCardBorder
                        ),
                        modifier = Modifier
                            .weight(1f)
                            .clickable {
                                selectedRole = UserRole.DEVELOPER
                                validationError = null
                            }
                            .testTag("role_developer_option")
                    ) {
                        Column(modifier = Modifier.padding(12.dp)) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.SpaceBetween,
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(
                                    imageVector = Icons.Default.BusinessCenter,
                                    contentDescription = null,
                                    tint = if (selectedRole == UserRole.DEVELOPER) PlotGold else PlotNavyDark,
                                    modifier = Modifier.size(20.dp)
                                )
                                if (selectedRole == UserRole.DEVELOPER) {
                                    Icon(
                                        imageVector = Icons.Default.CheckCircle,
                                        contentDescription = null,
                                        tint = PlotGold,
                                        modifier = Modifier.size(16.dp)
                                    )
                                }
                            }
                            Spacer(modifier = Modifier.height(6.dp))
                            Text(
                                text = "Developer",
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = if (selectedRole == UserRole.DEVELOPER) Color.White else PlotNavyDark
                            )
                            Text(
                                text = "SaaS Inventory & CRM",
                                fontSize = 10.sp,
                                color = if (selectedRole == UserRole.DEVELOPER) PlotGold else PlotTextMuted
                            )
                        }
                    }
                }
            }
        }

        // Credentials Input Form Card
        item {
            Card(
                shape = RoundedCornerShape(16.dp),
                colors = CardDefaults.cardColors(containerColor = PlotWhite),
                border = BorderStroke(1.dp, PlotCardBorder),
                modifier = Modifier.fillMaxWidth().testTag("auth_form_fields")
            ) {
                Column(
                    modifier = Modifier.padding(18.dp),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Text(
                        text = if (activeTab == AuthTabMode.LOGIN) {
                            if (selectedRole == UserRole.DEVELOPER) "Developer Sign In Credentials" else "Buyer Sign In Credentials"
                        } else {
                            if (selectedRole == UserRole.DEVELOPER) "Developer Account Information" else "Buyer Account Information"
                        },
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold,
                        color = PlotNavyDark
                    )

                    // Registration Additional Fields
                    if (activeTab == AuthTabMode.REGISTER) {
                        OutlinedTextField(
                            value = fullNameInput,
                            onValueChange = { fullNameInput = it; validationError = null },
                            label = { Text("Full Name *") },
                            placeholder = { Text(if (selectedRole == UserRole.DEVELOPER) "e.g. Arjun Reddy" else "e.g. Rahul Sharma") },
                            leadingIcon = { Icon(Icons.Default.Person, contentDescription = null, tint = PlotGreenPrimary) },
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().testTag("input_full_name")
                        )

                        if (selectedRole == UserRole.DEVELOPER) {
                            OutlinedTextField(
                                value = companyNameInput,
                                onValueChange = { companyNameInput = it; validationError = null },
                                label = { Text("Builder / Real Estate Company *") },
                                placeholder = { Text("e.g. Green Valley Developers Pvt Ltd") },
                                leadingIcon = { Icon(Icons.Default.Apartment, contentDescription = null, tint = PlotGold) },
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth().testTag("input_company_name")
                            )

                            OutlinedTextField(
                                value = roleTitleInput,
                                onValueChange = { roleTitleInput = it },
                                label = { Text("Designation / Title") },
                                placeholder = { Text("e.g. Managing Director & Land Developer") },
                                leadingIcon = { Icon(Icons.Default.Badge, contentDescription = null, tint = PlotNavyDark) },
                                singleLine = true,
                                shape = RoundedCornerShape(8.dp),
                                modifier = Modifier.fillMaxWidth().testTag("input_role_title")
                            )
                        }

                        OutlinedTextField(
                            value = phoneInput,
                            onValueChange = { phoneInput = it },
                            label = { Text("Mobile Phone Number") },
                            placeholder = { Text("+91 98450 12345") },
                            leadingIcon = { Icon(Icons.Default.Phone, contentDescription = null, tint = PlotGreenPrimary) },
                            singleLine = true,
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().testTag("input_phone")
                        )
                    }

                    // Email Address
                    OutlinedTextField(
                        value = emailInput,
                        onValueChange = { emailInput = it; validationError = null },
                        label = { Text(if (selectedRole == UserRole.DEVELOPER) "Developer Email *" else "Email Address *") },
                        placeholder = { Text(if (selectedRole == UserRole.DEVELOPER) "dev@greenvalley.in" else "buyer@gmail.com") },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Email,
                                contentDescription = null,
                                tint = if (selectedRole == UserRole.DEVELOPER) PlotNavyDark else PlotGreenPrimary
                            )
                        },
                        trailingIcon = {
                            if (emailInput.isNotEmpty()) {
                                IconButton(onClick = { emailInput = "" }) {
                                    Icon(Icons.Default.Clear, contentDescription = "Clear", tint = PlotTextMuted)
                                }
                            }
                        },
                        singleLine = true,
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email, imeAction = ImeAction.Next),
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().testTag("input_email")
                    )

                    // Password
                    OutlinedTextField(
                        value = passwordInput,
                        onValueChange = { passwordInput = it; validationError = null },
                        label = { Text("Password *") },
                        placeholder = { Text("Minimum 6 characters") },
                        leadingIcon = {
                            Icon(
                                Icons.Default.Lock,
                                contentDescription = null,
                                tint = if (selectedRole == UserRole.DEVELOPER) PlotNavyDark else PlotGreenPrimary
                            )
                        },
                        trailingIcon = {
                            IconButton(onClick = { isPasswordVisible = !isPasswordVisible }) {
                                Icon(
                                    imageVector = if (isPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                    contentDescription = "Toggle password visibility",
                                    tint = PlotTextMuted
                                )
                            }
                        },
                        visualTransformation = if (isPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(
                            keyboardType = KeyboardType.Password,
                            imeAction = if (activeTab == AuthTabMode.REGISTER) ImeAction.Next else ImeAction.Done
                        ),
                        keyboardActions = KeyboardActions(onDone = {
                            focusManager.clearFocus()
                            executeAuth(
                                activeTab = activeTab,
                                selectedRole = selectedRole,
                                fullName = fullNameInput,
                                companyName = companyNameInput,
                                roleTitle = roleTitleInput,
                                phone = phoneInput,
                                email = emailInput,
                                pass = passwordInput,
                                confirmPass = confirmPasswordInput,
                                viewModel = viewModel,
                                onValidationError = { validationError = it }
                            )
                        }),
                        singleLine = true,
                        shape = RoundedCornerShape(8.dp),
                        modifier = Modifier.fillMaxWidth().testTag("input_password")
                    )

                    // Confirm Password (Registration only)
                    if (activeTab == AuthTabMode.REGISTER) {
                        OutlinedTextField(
                            value = confirmPasswordInput,
                            onValueChange = { confirmPasswordInput = it; validationError = null },
                            label = { Text("Confirm Password *") },
                            placeholder = { Text("Re-enter password") },
                            leadingIcon = { Icon(Icons.Default.LockReset, contentDescription = null, tint = PlotNavyDark) },
                            trailingIcon = {
                                IconButton(onClick = { isConfirmPasswordVisible = !isConfirmPasswordVisible }) {
                                    Icon(
                                        imageVector = if (isConfirmPasswordVisible) Icons.Default.Visibility else Icons.Default.VisibilityOff,
                                        contentDescription = "Toggle confirm password visibility",
                                        tint = PlotTextMuted
                                    )
                                }
                            },
                            visualTransformation = if (isConfirmPasswordVisible) VisualTransformation.None else PasswordVisualTransformation(),
                            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password, imeAction = ImeAction.Done),
                            keyboardActions = KeyboardActions(onDone = {
                                focusManager.clearFocus()
                                executeAuth(
                                    activeTab = activeTab,
                                    selectedRole = selectedRole,
                                    fullName = fullNameInput,
                                    companyName = companyNameInput,
                                    roleTitle = roleTitleInput,
                                    phone = phoneInput,
                                    email = emailInput,
                                    pass = passwordInput,
                                    confirmPass = confirmPasswordInput,
                                    viewModel = viewModel,
                                    onValidationError = { validationError = it }
                                )
                            }),
                            singleLine = true,
                            shape = RoundedCornerShape(8.dp),
                            modifier = Modifier.fillMaxWidth().testTag("input_confirm_password")
                        )
                    }

                    // Local Validation & Firebase Error Banner
                    val activeError = validationError ?: uiState.developerAuthError
                    if (activeError != null) {
                        Surface(
                            shape = RoundedCornerShape(8.dp),
                            color = PlotRedLight,
                            border = BorderStroke(1.dp, PlotRed.copy(alpha = 0.3f)),
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Row(
                                modifier = Modifier.padding(10.dp),
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(8.dp)
                            ) {
                                Icon(Icons.Default.ErrorOutline, contentDescription = null, tint = PlotRed, modifier = Modifier.size(18.dp))
                                Text(
                                    text = activeError,
                                    color = PlotRed,
                                    fontSize = 12.sp,
                                    fontWeight = FontWeight.Medium
                                )
                            }
                        }
                    }

                    // Action Submission Button
                    Button(
                        onClick = {
                            focusManager.clearFocus()
                            executeAuth(
                                activeTab = activeTab,
                                selectedRole = selectedRole,
                                fullName = fullNameInput,
                                companyName = companyNameInput,
                                roleTitle = roleTitleInput,
                                phone = phoneInput,
                                email = emailInput,
                                pass = passwordInput,
                                confirmPass = confirmPasswordInput,
                                viewModel = viewModel,
                                onValidationError = { validationError = it }
                            )
                        },
                        enabled = !uiState.isAuthLoading,
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(
                            containerColor = if (selectedRole == UserRole.DEVELOPER) PlotNavyDark else PlotGreenPrimary
                        ),
                        modifier = Modifier
                            .fillMaxWidth()
                            .height(48.dp)
                            .testTag("auth_action_submit_btn")
                    ) {
                        if (uiState.isAuthLoading) {
                            CircularProgressIndicator(color = Color.White, modifier = Modifier.size(20.dp), strokeWidth = 2.dp)
                        } else {
                            Icon(
                                imageVector = if (activeTab == AuthTabMode.LOGIN) Icons.Default.Login else Icons.Default.HowToReg,
                                contentDescription = null,
                                tint = if (selectedRole == UserRole.DEVELOPER) PlotGold else Color.White,
                                modifier = Modifier.size(18.dp)
                            )
                            Spacer(modifier = Modifier.width(8.dp))
                            Text(
                                text = if (activeTab == AuthTabMode.LOGIN) {
                                    if (selectedRole == UserRole.DEVELOPER) "Sign In to Developer Console" else "Sign In as Buyer"
                                } else {
                                    if (selectedRole == UserRole.DEVELOPER) "Register Developer Account" else "Create Buyer Account"
                                },
                                fontSize = 14.sp,
                                fontWeight = FontWeight.Bold,
                                color = Color.White
                            )
                        }
                    }
                }
            }
        }

        // Quick Preset 1-Tap Logins (Demo Profiles)
        item {
            Card(
                shape = RoundedCornerShape(14.dp),
                colors = CardDefaults.cardColors(containerColor = PlotNavyLight.copy(alpha = 0.05f)),
                border = BorderStroke(1.dp, PlotCardBorder),
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Icon(Icons.Default.VpnKey, contentDescription = null, tint = PlotNavyDark, modifier = Modifier.size(18.dp))
                        Text(
                            text = "Quick Demo Accounts (1-Tap)",
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Bold,
                            color = PlotNavyDark
                        )
                    }

                    Text(
                        text = "Instantly test authentication sessions and role permissions without typing:",
                        fontSize = 11.sp,
                        color = PlotTextSecondary
                    )

                    // Developer 1: Green Valley Developers
                    AuthDemoAccountItem(
                        title = "Green Valley Developers Pvt Ltd",
                        email = "dev@greenvalley.in",
                        roleBadge = "Developer Role",
                        badgeBg = PlotNavyDark,
                        badgeText = PlotGold,
                        onClick = {
                            activeTab = AuthTabMode.LOGIN
                            selectedRole = UserRole.DEVELOPER
                            emailInput = "dev@greenvalley.in"
                            passwordInput = "plotflow2026"
                            viewModel.loginWithFirebaseAuth("dev@greenvalley.in", "plotflow2026", UserRole.DEVELOPER)
                        }
                    )

                    // App Owner / Super Admin
                    AuthDemoAccountItem(
                        title = "App Owner & Super Admin (Master Control)",
                        email = "owner@plotflow.in",
                        roleBadge = "Owner Admin",
                        badgeBg = PlotGold,
                        badgeText = PlotNavyDark,
                        onClick = {
                            viewModel.loginAdmin()
                        }
                    )

                    // Developer 2: Prestige Plotted Townships
                    AuthDemoAccountItem(
                        title = "Prestige Plotted Townships",
                        email = "prestige@plots.com",
                        roleBadge = "Developer Role",
                        badgeBg = PlotNavyDark,
                        badgeText = PlotGold,
                        onClick = {
                            activeTab = AuthTabMode.LOGIN
                            selectedRole = UserRole.DEVELOPER
                            emailInput = "prestige@plots.com"
                            passwordInput = "prestige2026"
                            viewModel.loginWithFirebaseAuth("prestige@plots.com", "prestige2026", UserRole.DEVELOPER)
                        }
                    )

                    // Buyer 1: Rahul Sharma
                    AuthDemoAccountItem(
                        title = "Rahul Sharma",
                        email = "buyer@gmail.com",
                        roleBadge = "Buyer Role",
                        badgeBg = PlotGreenSoft,
                        badgeText = PlotGreenDark,
                        onClick = {
                            activeTab = AuthTabMode.LOGIN
                            selectedRole = UserRole.BUYER
                            emailInput = "buyer@gmail.com"
                            passwordInput = "buyer2026"
                            viewModel.loginWithFirebaseAuth("buyer@gmail.com", "buyer2026", UserRole.BUYER)
                        }
                    )
                }
            }
        }

        // Return to Marketplace
        item {
            OutlinedButton(
                onClick = { viewModel.navigateTo(AppDestination.MARKETPLACE) },
                shape = RoundedCornerShape(10.dp),
                modifier = Modifier
                    .fillMaxWidth()
                    .height(46.dp)
                    .testTag("auth_return_marketplace_btn")
            ) {
                Icon(Icons.Default.ArrowBack, contentDescription = null, modifier = Modifier.size(16.dp))
                Spacer(modifier = Modifier.width(6.dp))
                Text(
                    text = "Back to Public Marketplace",
                    fontSize = 12.sp,
                    fontWeight = FontWeight.SemiBold,
                    color = PlotNavyDark
                )
            }
        }
    }
}

private fun executeAuth(
    activeTab: AuthTabMode,
    selectedRole: UserRole,
    fullName: String,
    companyName: String,
    roleTitle: String,
    phone: String,
    email: String,
    pass: String,
    confirmPass: String,
    viewModel: PlotFlowViewModel,
    onValidationError: (String?) -> Unit
) {
    val trimmedEmail = email.trim()
    val trimmedPass = pass.trim()

    if (trimmedEmail.isEmpty() || trimmedPass.isEmpty()) {
        onValidationError("Email and Password are required.")
        return
    }

    if (activeTab == AuthTabMode.REGISTER) {
        if (fullName.trim().isEmpty()) {
            onValidationError("Please enter your Full Name.")
            return
        }
        if (selectedRole == UserRole.DEVELOPER && companyName.trim().isEmpty()) {
            onValidationError("Please enter your Real Estate / Builder Company Name.")
            return
        }
        if (trimmedPass.length < 6) {
            onValidationError("Password must be at least 6 characters.")
            return
        }
        if (trimmedPass != confirmPass.trim()) {
            onValidationError("Passwords do not match.")
            return
        }

        onValidationError(null)
        viewModel.registerWithFirebaseAuth(
            displayName = fullName,
            email = trimmedEmail,
            pass = trimmedPass,
            role = selectedRole,
            companyName = companyName,
            roleTitle = roleTitle,
            phone = phone
        )
    } else {
        onValidationError(null)
        viewModel.loginWithFirebaseAuth(
            email = trimmedEmail,
            pass = trimmedPass,
            selectedRole = selectedRole
        )
    }
}

@Composable
private fun AuthDemoAccountItem(
    title: String,
    email: String,
    roleBadge: String,
    badgeBg: Color,
    badgeText: Color,
    onClick: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(10.dp),
        color = PlotWhite,
        border = BorderStroke(1.dp, PlotCardBorder),
        modifier = Modifier
            .fillMaxWidth()
            .clickable(onClick = onClick)
    ) {
        Row(
            modifier = Modifier.padding(12.dp),
            verticalAlignment = Alignment.CenterVertically,
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Column(modifier = Modifier.weight(1f)) {
                Text(text = title, fontSize = 12.sp, fontWeight = FontWeight.Bold, color = PlotNavyDark)
                Text(text = email, fontSize = 10.sp, color = PlotTextSecondary)
            }
            Surface(
                shape = RoundedCornerShape(6.dp),
                color = badgeBg
            ) {
                Text(
                    text = roleBadge,
                    fontSize = 9.sp,
                    fontWeight = FontWeight.Bold,
                    color = badgeText,
                    modifier = Modifier.padding(horizontal = 8.dp, vertical = 4.dp)
                )
            }
        }
    }
}
