package com.smartlogix.msventas.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Base64;

public class TokenUtils {

    public static String extraerCorreo(String tokenHeader) {
        if (tokenHeader == null || !tokenHeader.startsWith("Bearer ")) {
            throw new RuntimeException("Falta el token de autorización");
        }
        try {
            // Extraer solo la cadena del token
            String token = tokenHeader.replace("Bearer ", "");
            String[] chunks = token.split("\\.");

            // Decodificar el payload
            Base64.Decoder decoder = Base64.getUrlDecoder();
            String payload = new String(decoder.decode(chunks[1]));

            // Leer el JSON y extraer el "sub" (subject)
            ObjectMapper mapper = new ObjectMapper();
            JsonNode node = mapper.readTree(payload);
            return node.get("sub").asText();

        } catch (Exception e) {
            throw new RuntimeException("Token inválido o malformado");
        }
    }
}