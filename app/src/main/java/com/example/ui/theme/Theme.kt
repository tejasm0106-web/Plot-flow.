package com.example.ui.theme

import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.dynamicDarkColorScheme
import androidx.compose.material3.dynamicLightColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext

private val DarkColorScheme = darkColorScheme(
    primary = PlotGreenLight,
    onPrimary = PlotNavyDark,
    primaryContainer = PlotGreenDark,
    onPrimaryContainer = PlotGreenSoft,
    secondary = PlotNavyLight,
    onSecondary = PlotWhite,
    tertiary = PlotGold,
    background = PlotNavyDark,
    surface = PlotNavyCard,
    onBackground = PlotWhite,
    onSurface = PlotWhite,
    outline = PlotNavyLight
)

private val LightColorScheme = lightColorScheme(
    primary = PlotGreenPrimary,
    onPrimary = PlotWhite,
    primaryContainer = PlotGreenSoft,
    onPrimaryContainer = PlotGreenDark,
    secondary = PlotNavyDark,
    onSecondary = PlotWhite,
    secondaryContainer = Color(0xFFE2E8F0),
    onSecondaryContainer = PlotNavyDark,
    tertiary = PlotGold,
    background = PlotSurfaceLight,
    surface = PlotWhite,
    onBackground = PlotTextPrimary,
    onSurface = PlotTextPrimary,
    outline = PlotCardBorder,
    error = PlotRed,
    errorContainer = PlotRedLight
)

@Composable
fun MyApplicationTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Use PlotFlow signature branding by default
    content: @Composable () -> Unit
) {
    val colorScheme = when {
        dynamicColor && Build.VERSION.SDK_INT >= Build.VERSION_CODES.S -> {
            val context = LocalContext.current
            if (darkTheme) dynamicDarkColorScheme(context) else dynamicLightColorScheme(context)
        }
        darkTheme -> DarkColorScheme
        else -> LightColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
