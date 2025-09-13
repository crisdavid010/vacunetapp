-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-09-2025 a las 07:16:33
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `vacunetapp`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id_admin` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `rol` enum('admin','usuario') NOT NULL DEFAULT 'usuario'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `administradores`
--

INSERT INTO `administradores` (`id_admin`, `nombre`, `cedula`, `password_hash`, `rol`) VALUES
(1, 'Administrador Principal', '123456789', '$2b$10$H1nMfwIvmGRySk6V337BUuhUwBvboZ0C9zzzaOYrAciMIhQp6y57O', 'admin');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `certificado`
--

CREATE TABLE `certificado` (
  `id_certificado` int(11) NOT NULL,
  `id_cita_origen` int(11) NOT NULL,
  `fecha_envio` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `certificado`
--

INSERT INTO `certificado` (`id_certificado`, `id_cita_origen`, `fecha_envio`) VALUES
(1, 5, '2025-09-11 20:54:02');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id_cita` int(11) NOT NULL,
  `paciente` int(11) NOT NULL,
  `fecha_hora` datetime DEFAULT NULL,
  `id_vacuna_tipo` int(11) NOT NULL,
  `id_lote_asignado` int(11) DEFAULT NULL,
  `numero_dosis_aplicada` int(11) NOT NULL,
  `status` varchar(20) NOT NULL DEFAULT 'pendiente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`id_cita`, `paciente`, `fecha_hora`, `id_vacuna_tipo`, `id_lote_asignado`, `numero_dosis_aplicada`, `status`) VALUES
(1, 4, '2025-09-05 09:00:00', 9, 1, 1, 'completada'),
(2, 3, '2025-08-10 10:00:00', 16, 4, 1, 'completada'),
(3, 1, '2025-10-15 11:00:00', 14, NULL, 1, 'pendiente'),
(4, 2, '2025-10-16 14:30:00', 6, NULL, 1, 'pendiente'),
(5, 4, '2025-09-12 10:00:00', 2, NULL, 1, 'completada');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas_canceladas`
--

CREATE TABLE `citas_canceladas` (
  `id_cancelacion` int(11) NOT NULL,
  `id_cita_original` int(11) NOT NULL,
  `paciente` int(11) NOT NULL,
  `fecha_hora` datetime DEFAULT NULL,
  `id_vacuna_tipo` int(11) NOT NULL,
  `numero_dosis_aplicada` int(11) NOT NULL,
  `fecha_cancelacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas_canceladas`
--

INSERT INTO `citas_canceladas` (`id_cancelacion`, `id_cita_original`, `paciente`, `fecha_hora`, `id_vacuna_tipo`, `numero_dosis_aplicada`, `fecha_cancelacion`) VALUES
(1, 6, 3, '2025-09-12 10:00:00', 7, 1, '2025-09-12 01:54:09');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `citas_perdidas`
--

CREATE TABLE `citas_perdidas` (
  `id_perdida` int(11) NOT NULL,
  `id_cita_original` int(11) NOT NULL,
  `paciente` int(11) NOT NULL,
  `fecha_hora` datetime DEFAULT NULL,
  `id_vacuna_tipo` int(11) NOT NULL,
  `numero_dosis_aplicada` int(11) NOT NULL,
  `fecha_archivado` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `citas_perdidas`
--

INSERT INTO `citas_perdidas` (`id_perdida`, `id_cita_original`, `paciente`, `fecha_hora`, `id_vacuna_tipo`, `numero_dosis_aplicada`, `fecha_archivado`) VALUES
(1, 7, 3, '2025-09-12 10:00:00', 2, 1, '2025-09-13 02:52:42');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `informe`
--

CREATE TABLE `informe` (
  `id_informe` int(11) NOT NULL,
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  `tipo_informe` varchar(50) DEFAULT NULL,
  `id_vacuna_tipo_asociada` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `lotes_inventario`
--

CREATE TABLE `lotes_inventario` (
  `id_lote_inventario` int(11) NOT NULL,
  `id_vacuna_tipo` int(11) NOT NULL,
  `numero_lote` varchar(50) NOT NULL,
  `cantidad_disponible` int(11) NOT NULL DEFAULT 0,
  `fecha_caducidad` date NOT NULL,
  `fecha_ingreso` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `lotes_inventario`
--

INSERT INTO `lotes_inventario` (`id_lote_inventario`, `id_vacuna_tipo`, `numero_lote`, `cantidad_disponible`, `fecha_caducidad`, `fecha_ingreso`) VALUES
(1, 14, 'PZ-001A', 85, '2026-05-31', '2025-09-10 18:17:26'),
(2, 14, 'PZ-002B', 150, '2026-08-15', '2025-09-10 18:17:26'),
(3, 15, 'MD-X01', 120, '2026-07-20', '2025-09-10 18:17:26'),
(4, 16, 'JN-Y05', 200, '2026-12-01', '2025-09-10 18:17:26'),
(5, 17, 'SV-Z09', 50, '2025-11-30', '2025-09-10 18:17:26'),
(6, 14, 'PZ-003C-EXP', 120, '2026-09-20', '2025-09-10 18:17:26'),
(7, 9, '158526FF', 30, '2026-09-10', '2025-09-10 13:38:44'),
(8, 1, 'lote55', 100, '2026-09-10', '2025-09-11 20:59:20');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paciente`
--

CREATE TABLE `paciente` (
  `id_paciente` int(11) NOT NULL,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `direccion` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `paciente`
--

INSERT INTO `paciente` (`id_paciente`, `nombre`, `apellido`, `telefono`, `cedula`, `email`, `fecha_nacimiento`, `direccion`) VALUES
(1, 'Carlos', 'González', '3011234567', '1065123456', 'carlos.gonzalez@example.com', '1985-04-12', 'Bocagrande, Av. San Martín #5-25'),
(2, 'Ana María', 'Rodríguez', '3157654321', '1066789012', 'ana.rodriguez@example.com', '1992-08-22', 'Manga, Calle 25 #18-40'),
(3, 'Javier', 'Martínez', '3009876543', '73140980', 'javier.martinez@example.com', '1978-11-02', 'El Pozón, Sector La Paz Mz A Lote 10'),
(4, 'Cristian David', 'Alvarez Quiroz', '3205551234', '1143400158', 'cristian.alvarez@example.com', '1997-05-05', 'Crespo, Carrera 10 #70-112'),
(5, 'sofis andrea', 'ballestas castro', '311456532', '1143404289', 'sofis@gmail.com', '2001-05-15', 'Barrio las americas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `vacunas`
--

CREATE TABLE `vacunas` (
  `id_vacunas` int(11) NOT NULL,
  `fabricante` varchar(45) DEFAULT NULL,
  `nombre` varchar(45) DEFAULT NULL,
  `no_dosis` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `vacunas`
--

INSERT INTO `vacunas` (`id_vacunas`, `fabricante`, `nombre`, `no_dosis`) VALUES
(1, 'GSK', 'Hepatitis A', 2),
(2, 'Merck', 'Varicela', 2),
(3, 'GSK', 'Meningitis B,C', 2),
(4, 'Sanofi', 'Meningitis A,C,Y,W135', 1),
(5, 'Pfizer', 'Neumococo', 3),
(6, 'Sanofi', 'Influenza', 1),
(7, 'Merck', 'Triple Viral', 2),
(8, 'Sanofi', 'Fiebre Amarilla', 1),
(9, 'Merck', 'VPH', 3),
(10, 'Sanofi', 'Tétano Td', 1),
(11, 'GSK', 'Hepatitis B', 3),
(12, 'Sanofi', 'Fiebre Tifoidea', 1),
(13, 'GSK', 'DPTA', 1),
(14, 'Pfizer-BioNTech', 'Comirnaty', 2),
(15, 'Moderna', 'Spikevax', 2),
(16, 'Janssen', 'Ad26.COV2.S', 1),
(17, 'Sinovac', 'CoronaVac', 2);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id_admin`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- Indices de la tabla `certificado`
--
ALTER TABLE `certificado`
  ADD PRIMARY KEY (`id_certificado`),
  ADD UNIQUE KEY `id_cita_origen` (`id_cita_origen`);

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id_cita`),
  ADD KEY `fk_paciente_cita_idx` (`paciente`),
  ADD KEY `fk_vacuna_tipo_cita_idx` (`id_vacuna_tipo`),
  ADD KEY `fk_lote_asignado_cita_idx` (`id_lote_asignado`);

--
-- Indices de la tabla `citas_canceladas`
--
ALTER TABLE `citas_canceladas`
  ADD PRIMARY KEY (`id_cancelacion`),
  ADD KEY `idx_id_cita_original` (`id_cita_original`);

--
-- Indices de la tabla `citas_perdidas`
--
ALTER TABLE `citas_perdidas`
  ADD PRIMARY KEY (`id_perdida`),
  ADD KEY `idx_id_cita_original_perdida` (`id_cita_original`);

--
-- Indices de la tabla `informe`
--
ALTER TABLE `informe`
  ADD PRIMARY KEY (`id_informe`),
  ADD KEY `fk_vacuna_informe_idx` (`id_vacuna_tipo_asociada`);

--
-- Indices de la tabla `lotes_inventario`
--
ALTER TABLE `lotes_inventario`
  ADD PRIMARY KEY (`id_lote_inventario`),
  ADD KEY `fk_lote_vacuna_tipo_idx` (`id_vacuna_tipo`);

--
-- Indices de la tabla `paciente`
--
ALTER TABLE `paciente`
  ADD PRIMARY KEY (`id_paciente`),
  ADD UNIQUE KEY `cedula` (`cedula`);

--
-- Indices de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  ADD PRIMARY KEY (`id_vacunas`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id_admin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `certificado`
--
ALTER TABLE `certificado`
  MODIFY `id_certificado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id_cita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `citas_canceladas`
--
ALTER TABLE `citas_canceladas`
  MODIFY `id_cancelacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `citas_perdidas`
--
ALTER TABLE `citas_perdidas`
  MODIFY `id_perdida` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `informe`
--
ALTER TABLE `informe`
  MODIFY `id_informe` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `lotes_inventario`
--
ALTER TABLE `lotes_inventario`
  MODIFY `id_lote_inventario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `paciente`
--
ALTER TABLE `paciente`
  MODIFY `id_paciente` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `vacunas`
--
ALTER TABLE `vacunas`
  MODIFY `id_vacunas` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `certificado`
--
ALTER TABLE `certificado`
  ADD CONSTRAINT `fk_certificado_cita` FOREIGN KEY (`id_cita_origen`) REFERENCES `cita` (`id_cita`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `fk_lote_asignado_cita` FOREIGN KEY (`id_lote_asignado`) REFERENCES `lotes_inventario` (`id_lote_inventario`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_paciente_cita` FOREIGN KEY (`paciente`) REFERENCES `paciente` (`id_paciente`) ON DELETE NO ACTION ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_vacuna_tipo_cita` FOREIGN KEY (`id_vacuna_tipo`) REFERENCES `vacunas` (`id_vacunas`) ON DELETE NO ACTION ON UPDATE CASCADE;

--
-- Filtros para la tabla `informe`
--
ALTER TABLE `informe`
  ADD CONSTRAINT `fk_vacuna_tipo_informe` FOREIGN KEY (`id_vacuna_tipo_asociada`) REFERENCES `vacunas` (`id_vacunas`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Filtros para la tabla `lotes_inventario`
--
ALTER TABLE `lotes_inventario`
  ADD CONSTRAINT `fk_lote_vacuna_tipo` FOREIGN KEY (`id_vacuna_tipo`) REFERENCES `vacunas` (`id_vacunas`) ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
