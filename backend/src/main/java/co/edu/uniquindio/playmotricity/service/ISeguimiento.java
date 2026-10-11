package co.edu.uniquindio.playmotricity.service;

import co.edu.uniquindio.playmotricity.entity.ReporteProgreso;

import java.util.UUID;

public interface ISeguimiento {

    ReporteProgreso generarReporte(UUID perfilId);
}