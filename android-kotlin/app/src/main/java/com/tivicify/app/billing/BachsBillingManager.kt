package com.tivicify.app.billing

data class BachsPlanItem(
    val id: String,
    val name: String,
    val description: String,
    val tier: String,
    val priceNgn: Long,
    val priceUsd: Double,
    val isRecommended: Boolean = false,
    val features: List<String>
)

object BachsBillingManager {

    val plans = listOf(
        BachsPlanItem(
            id = "tivicify_pro_monthly",
            name = "Tivicify Pro Multi-View",
            description = "4-Screen Matrix, 100% ad-free, 4K UHD Streams",
            tier = "pro",
            priceNgn = 1500L,
            priceUsd = 3.99,
            isRecommended = true,
            features = listOf(
                "4-Screen Simultaneous Multi-View Matrix",
                "100% Ad-Free (No Unity video ads)",
                "Full HD 1080p & 4K Ultra HD priority",
                "Unlimited DVR Session Recording",
                "Android TV & Fire TV D-Pad Mode"
            )
        ),
        BachsPlanItem(
            id = "tivicify_vip_monthly",
            name = "VIP Family & Sports Pass",
            description = "Up to 5 screens & exclusive sports passes",
            tier = "vip",
            priceNgn = 3500L,
            priceUsd = 7.99,
            features = listOf(
                "Everything in Pro Multi-View",
                "Up to 5 simultaneous family screens",
                "Exclusive Sports Zone & Matchday Live",
                "Kids Mode with 4-Digit Parental PIN",
                "24/7 Dedicated WhatsApp Support"
            )
        )
    )

    fun getCheckoutUrl(planId: String, currency: String = "NGN"): String {
        val plan = plans.find { it.id == planId } ?: plans.first()
        val amount = if (currency == "NGN") plan.priceNgn else plan.priceUsd
        val sessionId = "bachs_sess_" + System.currentTimeMillis()
        return "https://bachs.io/pay/$sessionId?amount=$amount&currency=$currency&plan=${plan.id}"
    }

    fun verifyVoucherCode(codeRaw: String): VoucherResult {
        val code = codeRaw.trim().uppercase().replace(" ", "").replace("-", "")
        if (code.isEmpty()) {
            return VoucherResult(false, "free", 0L, "Please enter an activation code.")
        }

        val now = System.currentTimeMillis()
        val oneMonth = 30L * 24 * 60 * 60 * 1000
        val oneYear = 365L * 24 * 60 * 60 * 1000

        if (code.contains("VIP") || code == "TIVICIFYVIP" || code == "TIVIVIP2026") {
            return VoucherResult(
                success = true,
                tier = "vip",
                expiresAt = now + oneMonth,
                message = "VIP Family Pass activated! 5 screens and ad-free playback unlocked."
            )
        }

        if (code.contains("PRO") || code == "TIVICIFYPRO" || code == "TIVIPRO2026" || code == "BACHSIOPASS" || code == "TIVICIFY2026") {
            return VoucherResult(
                success = true,
                tier = "pro",
                expiresAt = now + oneMonth,
                message = "Tivicify Pro activated! 4-Screen Multi-View and ad-free mode are now active."
            )
        }

        if (code.contains("LIFETIME")) {
            return VoucherResult(
                success = true,
                tier = "vip",
                expiresAt = now + (10 * oneYear),
                message = "Lifetime VIP Pass activated! Unlimited access on all devices."
            )
        }

        return VoucherResult(
            success = false,
            tier = "free",
            expiresAt = 0L,
            message = "Invalid or expired activation voucher. Please check and try again."
        )
    }
}

data class VoucherResult(
    val success: Boolean,
    val tier: String,
    val expiresAt: Long,
    val message: String
)
