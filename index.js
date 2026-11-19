// npm init -> cria o pacote inicial API
// npm i express
const express = require("express")
const app = express()
app.use(express.json())
const port = 3000
// npm i mysql2
const db = require("./db")

app.delete("/aula/:id", async (req, res) => {
    try {
        const { id } = req.params
        const [aula] = await db.pool.query(
            "SELECT id FROM aula WHERE id = ?",
            [id]
        )
        if (aula.length === 0) {
            return res.status(404).json({ erro: "Aula não encontrada." })
        }
        const [horarios] = await db.pool.query(
            "SELECT id FROM horario WHERE aula_id = ?",
            [id]
        )
        if (horarios.length > 0) {
            return res.status(400).json({
                erro: "Não é possível excluir: existem horários cadastrados para esta aula."
            })
        }

        const [resultado] = await db.pool.query(
            "DELETE FROM aula WHERE id = ?",
            [id]
        )
        res.status(200).json({
            mensagem: "Aula removida com sucesso.",
            linhasAfetadas: resultado.affectedRows
        })
    } catch (erro) {
        if (erro.code === "ER_ROW_IS_REFERENCED_2") {
            return res.status(400).json({
                erro: "Aula possui horários vinculados (violação de chave estrangeira)."
            })
        }
        res.status(500).json({ erro: erro.message })
    }
})

app.post("/horario", async (req, res) => {
    try {
        const { aula_id, dia_semana, hora_inicio, hora_fim } = req.body
        if (!aula_id || !dia_semana || !hora_inicio || !hora_fim) {
            return res.status(400).json({
                erro: "Campos obrigatórios: aula_id, dia_semana, hora_inicio, hora_fim."
            })
        }
        const [aula] = await db.pool.query(
            "SELECT id FROM aula WHERE id = ?",
            [aula_id]
        )
        if (aula.length === 0) {
            return res.status(400).json({
                erro: `A aula com id=${aula_id} não existe. Não é possível cadastrar o horário.`
            })
        }

        const [resultado] = await db.pool.query(
            "INSERT INTO horario (aula_id, dia_semana, hora_inicio, hora_fim) VALUES (?, ?, ?, ?)",
            [aula_id, dia_semana, hora_inicio, hora_fim]
        )
        res.status(201).json({
            mensagem: "Horário cadastrado com sucesso.",
            id: resultado.insertId
        })
    } catch (erro) {
        if (erro.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({
                erro: "A aula informada não existe (violação de chave estrangeira)."
            })
        }
        res.status(500).json({ erro: erro.message })
    }
})

app.get("/horario/:dia", async (req, res) => {
    try {
        const { dia } = req.params
        const [resultado] = await db.pool.query(
            `SELECT h.id, h.aula_id, h.dia_semana, h.hora_inicio, h.hora_fim,
                    a.serie, a.turma, a.componente, a.professor
             FROM horario h
             INNER JOIN aula a ON a.id = h.aula_id
             WHERE LOWER(h.dia_semana) = LOWER(?)
             ORDER BY h.hora_inicio`,
            [dia]
        )
        if (resultado.length === 0) {
            return res.status(404).json({
                mensagem: `Nenhum horário encontrado para o dia "dia"`
            })
        }
        res.status(200).json(resultado)
    } catch (erro) {
        res.status(500).json({ erro: erro.message })
    }
})

app.delete("/horario/:id", async (req, res) => {
    try {
        const { id } = req.params
        const [resultado] = await db.pool.query(
            "DELETE FROM horario WHERE id = ?",
            [id]
        )
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Horário não encontrado." })
        }
        res.status(200).json({
            mensagem: "Horário removido com sucesso.",
            linhasAfetadas: resultado.affectedRows
        })
    } catch (erro) {
        res.status(500).json({ erro: erro.message })
    }
})