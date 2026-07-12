package com.smartlogix.msventas.dto;

public record DireccionResponse(
        Long idDireccion,
        Long idCliente,
        Integer idComuna,
        String calle,
        String numero,
        String detalle,
        Boolean esPrincipal,
        String comuna
) {
    public String getDireccionCompleta() {
        return (calle != null ? calle : "") + " " +
                (numero != null ? numero : "") +
                (detalle != null ? ", " + detalle : "");
    }
}