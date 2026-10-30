package com.tivicify.app.ui.components

import android.content.Intent
import android.net.Uri
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
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import com.tivicify.app.billing.BachsBillingManager
import com.tivicify.app.ui.theme.*

@Composable
fun SubscriptionDialog(
    onDismiss: () -> Unit,
    onSubscriptionActivated: (tier: String, expiresAt: Long) -> Unit
) {
    val context = LocalContext.current
    var currency by remember { mutableStateOf("NGN") }
    var selectedPlanId by remember { mutableStateOf("tivicify_pro_monthly") }
    var voucherCode by remember { mutableStateOf("") }
    var feedbackMessage by remember { mutableStateOf<String?>(null) }
    var isSuccess by remember { mutableStateOf(false) }

    Dialog(onDismissRequest = onDismiss) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.88f),
            shape = RoundedCornerShape(18.dp),
            color = SurfaceDark,
            border = BorderStroke(1.dp, BorderDark)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(20.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            Text(
                                text = "Tivicify Pro Pass",
                                style = MaterialTheme.typography.headlineMedium,
                                color = TextPrimary,
                                fontSize = 18.sp
                            )
                            Spacer(modifier = Modifier.width(6.dp))
                            Surface(
                                shape = RoundedCornerShape(4.dp),
                                color = PrimaryBlue.copy(alpha = 0.2f),
                                border = BorderStroke(1.dp, AccentCyan.copy(alpha = 0.4f))
                            ) {
                                Text(
                                    text = "bachs.io",
                                    color = AccentCyan,
                                    fontSize = 10.sp,
                                    fontWeight = FontWeight.Bold,
                                    modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                                )
                            }
                        }
                        Text(
                            text = "4-Screen Multi-View • 100% Ad-Free (No Unity Ads)",
                            color = TextSecondary,
                            fontSize = 11.sp
                        )
                    }

                    IconButton(onClick = onDismiss, modifier = Modifier.size(28.dp)) {
                        Icon(Icons.Default.Close, contentDescription = "Close", tint = TextSecondary)
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Currency Toggle
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text("Currency:", color = TextSecondary, fontSize = 12.sp)
                    Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                        FilterChip(
                            selected = currency == "NGN",
                            onClick = { currency = "NGN" },
                            label = { Text("₦ NGN", fontSize = 11.sp) }
                        )
                        FilterChip(
                            selected = currency == "USD",
                            onClick = { currency = "USD" },
                            label = { Text("$ USD", fontSize = 11.sp) }
                        )
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Feedback Alert
                if (feedbackMessage != null) {
                    Surface(
                        modifier = Modifier.fillMaxWidth(),
                        shape = RoundedCornerShape(8.dp),
                        color = if (isSuccess) SuccessEmerald.copy(alpha = 0.15f) else LiveRed.copy(alpha = 0.15f),
                        border = BorderStroke(1.dp, if (isSuccess) SuccessEmerald else LiveRed)
                    ) {
                        Text(
                            text = feedbackMessage!!,
                            color = if (isSuccess) SuccessEmerald else LiveRed,
                            fontSize = 12.sp,
                            modifier = Modifier.padding(10.dp)
                        )
                    }
                    Spacer(modifier = Modifier.height(12.dp))
                }

                // Plan Cards
                BachsBillingManager.plans.forEach { plan ->
                    val isSelected = selectedPlanId == plan.id
                    val priceText = if (currency == "NGN") "₦${plan.priceNgn}" else "$${plan.priceUsd}"

                    Surface(
                        modifier = Modifier
                            .fillMaxWidth()
                            .padding(vertical = 4.dp)
                            .clickable { selectedPlanId = plan.id },
                        shape = RoundedCornerShape(12.dp),
                        color = if (isSelected) SurfaceCard else SurfaceDark,
                        border = BorderStroke(
                            width = if (isSelected) 2.dp else 1.dp,
                            color = if (isSelected) AccentCyan else BorderDark
                        )
                    ) {
                        Column(modifier = Modifier.padding(14.dp)) {
                            Row(
                                modifier = Modifier.fillMaxWidth(),
                                horizontalArrangement = Arrangement.SpaceBetween,
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                Text(
                                    text = plan.name,
                                    style = MaterialTheme.typography.titleMedium,
                                    color = TextPrimary,
                                    fontSize = 14.sp
                                )
                                Text(
                                    text = "$priceText/mo",
                                    color = AccentCyan,
                                    fontWeight = FontWeight.Bold,
                                    fontSize = 14.sp
                                )
                            }
                            Text(plan.description, color = TextMuted, fontSize = 11.sp, modifier = Modifier.padding(top = 2.dp))

                            Spacer(modifier = Modifier.height(8.dp))

                            plan.features.take(3).forEach { feat ->
                                Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(vertical = 1.dp)) {
                                    Icon(Icons.Default.Check, contentDescription = null, tint = AccentCyan, modifier = Modifier.size(14.dp))
                                    Spacer(modifier = Modifier.width(6.dp))
                                    Text(feat, color = TextSecondary, fontSize = 11.sp)
                                }
                            }
                        }
                    }
                }

                Spacer(modifier = Modifier.height(14.dp))

                // Bachs Checkout Button
                Button(
                    onClick = {
                        val checkoutUrl = BachsBillingManager.getCheckoutUrl(selectedPlanId, currency)
                        try {
                            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(checkoutUrl))
                            context.startActivity(intent)
                        } catch (e: Exception) {
                            // Ignore if no browser
                        }
                        // Instantly activate for demonstration
                        val now = System.currentTimeMillis()
                        val oneMonth = 30L * 24 * 60 * 60 * 1000
                        val tier = if (selectedPlanId.contains("vip")) "vip" else "pro"
                        onSubscriptionActivated(tier, now + oneMonth)
                        isSuccess = true
                        feedbackMessage = "Bachs.io checkout launched! Pro membership unlocked."
                    },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(10.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = PrimaryBlue)
                ) {
                    Icon(Icons.Default.CreditCard, contentDescription = null, modifier = Modifier.size(16.dp))
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Subscribe with Bachs.io Checkout", fontWeight = FontWeight.Bold)
                }

                Spacer(modifier = Modifier.height(18.dp))

                // Activation Code Section
                Text("Have an Activation Voucher Code?", color = TextPrimary, fontSize = 13.sp, fontWeight = FontWeight.Bold)
                Text("Enter voucher received from vendor or WhatsApp:", color = TextSecondary, fontSize = 11.sp)

                Spacer(modifier = Modifier.height(6.dp))

                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedTextField(
                        value = voucherCode,
                        onValueChange = { voucherCode = it },
                        modifier = Modifier.weight(1f),
                        placeholder = { Text("e.g. TIVI-PRO-2026", color = TextMuted, fontSize = 12.sp) },
                        singleLine = true,
                        colors = OutlinedTextFieldDefaults.colors(
                            focusedBorderColor = AccentCyan,
                            unfocusedBorderColor = BorderDark,
                            focusedTextColor = TextPrimary,
                            unfocusedTextColor = TextPrimary,
                            focusedContainerColor = BackgroundDark,
                            unfocusedContainerColor = BackgroundDark
                        ),
                        shape = RoundedCornerShape(8.dp)
                    )

                    Button(
                        onClick = {
                            val res = BachsBillingManager.verifyVoucherCode(voucherCode)
                            if (res.success) {
                                isSuccess = true
                                feedbackMessage = res.message
                                onSubscriptionActivated(res.tier, res.expiresAt)
                                voucherCode = ""
                            } else {
                                isSuccess = false
                                feedbackMessage = res.message
                            }
                        },
                        shape = RoundedCornerShape(8.dp),
                        colors = ButtonDefaults.buttonColors(containerColor = AccentCyan)
                    ) {
                        Text("Redeem", color = Color.Black, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}
