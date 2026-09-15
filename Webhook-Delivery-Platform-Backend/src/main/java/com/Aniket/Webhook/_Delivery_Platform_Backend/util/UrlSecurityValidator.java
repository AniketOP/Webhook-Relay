package com.Aniket.Webhook._Delivery_Platform_Backend.util;


import java.net.InetAddress;
import java.net.URI;

public class UrlSecurityValidator {

    public static boolean isSafeUrl(String urlString){
        try{
            URI uri = new URI(urlString);
            String host = uri.getHost();

            if(host == null){
                return false;
            }
            InetAddress address  = InetAddress.getByName(host);

            if(address.isLoopbackAddress()
                || address.isAnyLocalAddress()
                    || address.isLinkLocalAddress()
                        || address.isSiteLocalAddress()){

                return false;

            }

            return true;
        } catch (Exception e) {
            return false;
        }
    }

}
