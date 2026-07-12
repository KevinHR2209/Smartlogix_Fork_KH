package com.smartlogix.msventas.dto;

public record DireccionClienteResponse(
        String calle,
        String numero,
        String detalle,
        String comuna
) {
    public String getDireccionCompleta() {
        return calle
                + " " + (numero != null ? numero : "")
                + " " + (detalle != null ? detalle : "");
    }
}