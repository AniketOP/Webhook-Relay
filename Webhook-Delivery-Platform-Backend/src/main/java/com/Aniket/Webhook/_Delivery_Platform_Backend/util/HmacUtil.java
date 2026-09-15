package com.Aniket.Webhook._Delivery_Platform_Backend.util;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

public class HmacUtil {

    private static final String ALGORITHM = "HmacSHA256";

    public static String sign(String data, String secret)
    {
        try
        {
            Mac mac = Mac.getInstance(ALGORITHM);
            SecretKeySpec keySpec =  new SecretKeySpec(secret.getBytes(), ALGORITHM);
            mac.init(keySpec);

            byte[] signatureBytes = mac.doFinal(data.getBytes());
            return Base64.getEncoder().encodeToString(signatureBytes);

        } catch (Exception e) {
            throw new RuntimeException("Failed to compute HMAC signature", e);
        }
    }
}
