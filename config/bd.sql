-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: blao5xqfq9hfx2xk7rgf-mysql.services.clever-cloud.com:3306
-- Tiempo de generación: 14-08-2024 a las 01:09:10
-- Versión del servidor: 8.0.22-13
-- Versión de PHP: 8.2.21

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `blao5xqfq9hfx2xk7rgf`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `asientos`
--

CREATE TABLE `asientos` (
  `idAsiento` int NOT NULL,
  `idSalaAsiento` int NOT NULL,
  `filaAsiento` varchar(10) NOT NULL,
  `numeroAsiento` int NOT NULL,
  `estadoAsiento` enum('disponible','ocupado') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `boletos`
--

CREATE TABLE `boletos` (
  `idBoleto` int NOT NULL,
  `idPelicula` int NOT NULL,
  `idHorario` int NOT NULL,
  `idSala` int NOT NULL,
  `idPago` int NOT NULL,
  `idAsientoReservado` int NOT NULL,
  `fechaReserva` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cartelera`
--

CREATE TABLE `cartelera` (
  `idCartelera` int NOT NULL,
  `idPelicula` int NOT NULL,
  `idHorario` int NOT NULL,
  `idSala` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `dulceria`
--

CREATE TABLE `dulceria` (
  `idProducto` int NOT NULL,
  `nombreProducto` varchar(50) NOT NULL,
  `precioProducto` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `horarios`
--

CREATE TABLE `horarios` (
  `idHorario` int NOT NULL,
  `horaProgramada` time NOT NULL,
  `fechaDeEmision` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `logs`
--

CREATE TABLE `logs` (
  `idLog` int NOT NULL,
  `usuario` varchar(100) NOT NULL,
  `accion` text NOT NULL,
  `fechaHora` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `host` varchar(255) NOT NULL,
  `navegador` varchar(255) NOT NULL,
  `sistemaOperativo` varchar(255) NOT NULL,
  `tipoDispositivo` varchar(255) NOT NULL,
  `direccionIP` varchar(45) NOT NULL,
  `ubicacion` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `logs`
--

INSERT INTO `logs` (`idLog`, `usuario`, `accion`, `fechaHora`, `host`, `navegador`, `sistemaOperativo`, `tipoDispositivo`, `direccionIP`, `ubicacion`) VALUES
(1, '20', 'loginUsuario', '2024-08-14 01:00:05', 'apiboletos.onrender.com', 'Desconocido Desconocido', 'Desconocido Desconocido', 'Desconocido', '45.174.75.35, 10.219.43.124, 10.220.132.239', 'Desconocida, Desconocida, Desconocido'),
(2, '19', 'loginUsuario', '2024-08-14 01:00:23', 'apiboletos.onrender.com', 'Desconocido Desconocido', 'Desconocido Desconocido', 'Desconocido', '45.174.75.35, 10.219.43.124, 10.220.209.205', 'Desconocida, Desconocida, Desconocido'),
(3, '19', 'logoutUsuario', '2024-08-14 01:01:33', 'apiboletos.onrender.com', 'Desconocido Desconocido', 'Desconocido Desconocido', 'Desconocido', '45.174.75.35, 10.219.43.124, 10.220.209.205', 'Desconocida, Desconocida, Desconocido'),
(4, '20', 'loginUsuario', '2024-08-14 01:02:08', 'apiboletos.onrender.com', 'Desconocido Desconocido', 'Desconocido Desconocido', 'Desconocido', '45.174.75.35, 10.219.43.124, 10.220.209.205', 'Desconocida, Desconocida, Desconocido'),
(5, '20', 'logoutUsuario', '2024-08-14 01:02:15', 'apiboletos.onrender.com', 'Desconocido Desconocido', 'Desconocido Desconocido', 'Desconocido', '45.174.75.35, 10.219.43.124, 10.220.104.235', 'Desconocida, Desconocida, Desconocido'),
(6, '20', 'loginUsuario', '2024-08-14 01:02:49', 'apiboletos.onrender.com', 'Desconocido Desconocido', 'Desconocido Desconocido', 'Desconocido', '45.174.75.35, 10.219.43.124, 10.220.209.205', 'Desconocida, Desconocida, Desconocido'),
(7, '20', 'loginUsuario', '2024-08-14 01:08:59', 'apiboletos.onrender.com', 'Desconocido Desconocido', 'Desconocido Desconocido', 'Desconocido', '45.174.75.35, 10.219.43.124, 10.220.209.205', 'Desconocida, Desconocida, Desconocido');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `idCompra` int NOT NULL,
  `idUsuario` int NOT NULL,
  `cantidadPago` int NOT NULL,
  `metodoPago` enum('tarjeta','efectivo','terceros') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `peliculas`
--

CREATE TABLE `peliculas` (
  `idPelicula` int NOT NULL,
  `nombrePelicula` varchar(255) NOT NULL,
  `directorPelicula` varchar(255) NOT NULL,
  `duracionPelicula` int NOT NULL,
  `actoresPelicula` text NOT NULL,
  `clasificacionPelicula` varchar(50) NOT NULL,
  `idHorario` int NOT NULL,
  `precioBoleto` int NOT NULL,
  `imagenPelicula` longtext NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `salas`
--

CREATE TABLE `salas` (
  `idSala` int NOT NULL,
  `nombreSala` varchar(100) NOT NULL,
  `cantidadAsientos` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `idUsuario` int NOT NULL,
  `nombreUsuario` varchar(100) NOT NULL,
  `apellidoUsuario` varchar(100) NOT NULL,
  `edadUsuario` int NOT NULL,
  `correoUsuario` varchar(100) NOT NULL,
  `telefonoUsuario` varchar(20) NOT NULL,
  `contrasenaUsuario` longtext CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL,
  `tipoUsuario` enum('cliente','admin','otro') CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT 'cliente'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`idUsuario`, `nombreUsuario`, `apellidoUsuario`, `edadUsuario`, `correoUsuario`, `telefonoUsuario`, `contrasenaUsuario`, `tipoUsuario`) VALUES
(4, 'juan', 'perez', 30, 'juanito1@gmail.com', '5555555556', '$2a$10$nH8tJnk6fbBcEsCup2BOgugWqaqN.5e8e7D5c4PEVVINk3QzYc/Na', 'admin'),
(5, 'diana', 'perez', 30, 'diana1@gmail.com', '5555555556', '$2a$10$OuD6K1NNSPazba1sZVuFQuzDvUKE0eBv3y5vQIqYTJkHpIeSaTIJ.', 'cliente'),
(6, 'jesus', 'vargas', 30, 'jesus@gmail.com', '4651054564', '$2a$10$hlLZQyBh9pouq9wYsPt47eLJjhIX0jApWVsCe/tdGBFLfKEfDpNJG', 'admin'),
(7, 'si', 'si', 30, 'si@gmail.com', '5555555556', '$2a$10$Bt5kADeFgDpBJ.07T7qoROQYdZyPV8SfThyLB5qIQoi3ZuAr.AiDy', 'cliente'),
(9, 'juanxacsdc', 'perwfweez', 30, 'juanitwfwfo1@gmail.com', '5555555556', '$2a$10$KpnPd.m2.KsMJrKsIiT8g.ihdHaIFb19FC5msIhIjHcVkrAT2YKKi', 'cliente'),
(13, 'itzel', 'vega', 25, 'itzel@gmail.com', '4449992223', '$2a$10$hmMWWeRKgSzhw5fAMXqjKuxA1PuS5v6OUXKKBZpxQN3/HCad34YU2', 'cliente'),
(14, 'pepe', 'solis', 33, 'pepe@gmail.com', '5555555556', '$2a$10$3xEfozi9u3UYC2LuVx/yJOwSfox0G6YYLaHmUwOPm5RA3opMBW/9W', 'cliente'),
(15, 'paco', 'solis', 23, 'paco@gmail.com', '5555555556', '$2a$10$Ftt8QPtCSgGWOpRTltqwCe1HkfD8kX/CWwLFw5.bdrISykE97tlu6', 'cliente'),
(16, 'beto', 'colis', 44, 'beto@gmail.com', '4927834658', '$2a$10$RYA0Ht5KFTiiaSTVgjXjr.J8H3XjwWDJ6FeYfu9552iuqlJEd7Kuy', 'cliente'),
(17, 'Miguel', 'Macias', 20, 'miguelmacias@gmail.com', '3346928906', '$2a$10$X.heBRadppbf7zxrZQyJwO.Garb4/jpxumATm2pG0E7izMvF34BVi', 'cliente'),
(18, 'dan', 'yyy', 21, 'si2@gmail.com', '5555555556', '$2a$10$Ny7qpD6Afx/vm20s0AAk1e6lwFiXey/ZgvdJWPNRhgK9CKjYhOzyK', 'admin'),
(19, 'Miguel', 'Macias', 12, 'miguel@gmail.com', '4494912164', '$2a$10$u.dXeMDtzy/Bmpy9MFVnreHAQrCFEOGUYZcujb0EK3IayP/ZdcNCS', 'admin'),
(20, 'jesus', 'vargas', 18, 'jesus2@gmail.com', '4581254565', '$2a$10$9Kkvz1GzJtlCboCjiP..0.ebzsoJvTGtuRlpRc.Q7ljQPl2TBRkSa', 'admin');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `asientos`
--
ALTER TABLE `asientos`
  ADD PRIMARY KEY (`idAsiento`),
  ADD KEY `idSalaAsiento` (`idSalaAsiento`);

--
-- Indices de la tabla `boletos`
--
ALTER TABLE `boletos`
  ADD PRIMARY KEY (`idBoleto`),
  ADD KEY `idPelicula` (`idPelicula`),
  ADD KEY `idHorario` (`idHorario`),
  ADD KEY `idSala` (`idSala`),
  ADD KEY `idPago` (`idPago`),
  ADD KEY `idAsientoReservado` (`idAsientoReservado`);

--
-- Indices de la tabla `cartelera`
--
ALTER TABLE `cartelera`
  ADD PRIMARY KEY (`idCartelera`),
  ADD KEY `idPelicula` (`idPelicula`),
  ADD KEY `idHorario` (`idHorario`),
  ADD KEY `idSala` (`idSala`);

--
-- Indices de la tabla `dulceria`
--
ALTER TABLE `dulceria`
  ADD PRIMARY KEY (`idProducto`);

--
-- Indices de la tabla `horarios`
--
ALTER TABLE `horarios`
  ADD PRIMARY KEY (`idHorario`);

--
-- Indices de la tabla `logs`
--
ALTER TABLE `logs`
  ADD PRIMARY KEY (`idLog`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`idCompra`),
  ADD KEY `idUsuario` (`idUsuario`);

--
-- Indices de la tabla `peliculas`
--
ALTER TABLE `peliculas`
  ADD PRIMARY KEY (`idPelicula`),
  ADD KEY `idHorario` (`idHorario`);

--
-- Indices de la tabla `salas`
--
ALTER TABLE `salas`
  ADD PRIMARY KEY (`idSala`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`idUsuario`),
  ADD UNIQUE KEY `correoUsuario` (`correoUsuario`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `asientos`
--
ALTER TABLE `asientos`
  MODIFY `idAsiento` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `boletos`
--
ALTER TABLE `boletos`
  MODIFY `idBoleto` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cartelera`
--
ALTER TABLE `cartelera`
  MODIFY `idCartelera` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `dulceria`
--
ALTER TABLE `dulceria`
  MODIFY `idProducto` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `horarios`
--
ALTER TABLE `horarios`
  MODIFY `idHorario` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `logs`
--
ALTER TABLE `logs`
  MODIFY `idLog` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `idCompra` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `peliculas`
--
ALTER TABLE `peliculas`
  MODIFY `idPelicula` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `salas`
--
ALTER TABLE `salas`
  MODIFY `idSala` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `idUsuario` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `asientos`
--
ALTER TABLE `asientos`
  ADD CONSTRAINT `asientos_ibfk_1` FOREIGN KEY (`idSalaAsiento`) REFERENCES `salas` (`idSala`);

--
-- Filtros para la tabla `boletos`
--
ALTER TABLE `boletos`
  ADD CONSTRAINT `boletos_ibfk_1` FOREIGN KEY (`idPelicula`) REFERENCES `peliculas` (`idPelicula`),
  ADD CONSTRAINT `boletos_ibfk_2` FOREIGN KEY (`idHorario`) REFERENCES `horarios` (`idHorario`),
  ADD CONSTRAINT `boletos_ibfk_3` FOREIGN KEY (`idSala`) REFERENCES `salas` (`idSala`),
  ADD CONSTRAINT `boletos_ibfk_4` FOREIGN KEY (`idPago`) REFERENCES `pagos` (`idCompra`),
  ADD CONSTRAINT `boletos_ibfk_5` FOREIGN KEY (`idAsientoReservado`) REFERENCES `asientos` (`idAsiento`);

--
-- Filtros para la tabla `cartelera`
--
ALTER TABLE `cartelera`
  ADD CONSTRAINT `cartelera_ibfk_1` FOREIGN KEY (`idPelicula`) REFERENCES `peliculas` (`idPelicula`),
  ADD CONSTRAINT `cartelera_ibfk_2` FOREIGN KEY (`idHorario`) REFERENCES `horarios` (`idHorario`),
  ADD CONSTRAINT `cartelera_ibfk_3` FOREIGN KEY (`idSala`) REFERENCES `salas` (`idSala`);

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`idUsuario`) REFERENCES `usuarios` (`idUsuario`);

--
-- Filtros para la tabla `peliculas`
--
ALTER TABLE `peliculas`
  ADD CONSTRAINT `peliculas_ibfk_1` FOREIGN KEY (`idHorario`) REFERENCES `horarios` (`idHorario`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
