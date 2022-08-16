CREATE DATABASE IF NOT EXISTS `nodelogin` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `nodelogin`;

CREATE TABLE `accounts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `ocorrencias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numeroOcorrencia` int NOT NULL,
  `descricaoOcorrencia` varchar(255) NOT NULL,
  `clienteOcorrencia` varchar(144) NOT NULL,
  `dataOcorrencia` date NOT NULL,
  `versaoErro` varchar(90) NOT NULL,
  `modulo` varchar(90) NOT NULL,
  `resolvida` varchar(1) NOT NULL,
  `status` varchar(90) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `resolvidas` (
  `id` int NOT NULL AUTO_INCREMENT,
  `idOcorrencia` int NOT NULL,
  `versaoSolucao` varchar(255) NOT NULL,
  `baseTestada` varchar(144) NOT NULL,
  `procedimentos` varchar(255) NOT NULL,
  PRIMARY KEY (id),
  FOREIGN KEY (idOcorrencia) references ocorrencias(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;






