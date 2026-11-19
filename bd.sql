CREATE TABLE horario (
    id INT AUTO_INCREMENT PRIMARY KEY,
    aula_id INT NOT NULL,
    dia_semana VARCHAR(20) NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    CONSTRAINT fk_horario_aula
        FOREIGN KEY (aula_id) REFERENCES aula(id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
);