import * as Yup from 'yup'
import User from '../models/User'

class UserController {
  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),

    })

    if (!(await schema.isValid(req.body))) return res.status(400).json({ error: "Validation fails" })
    const userExist = await User.findOne({ where: { email: req.body.email } })
    if (userExist) return res.status(400).json({ error: "User already exist" })

    const { id, name, email, provider } = await User.create(req.body)
    return res.json({
      id, name, email, provider
    })
  }

  async update(req, res) {

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      //when ele tem acesso as variaveis anteriores
      //voce define qual parametro voce quer pegar e passa como funcao
      //a field é o propio campo em questao
      //aqui ele verifica se o oldpassword ta preenchido caso sim o campo password
      //é obrigatório
      password: Yup.string().min(6).when('oldPassword', (oldPassword, field) =>
        oldPassword ? field.required() : field),
      //a função oneOf diz que o campo tem que ter um dos valores ali presente
      //já a função yup.ref faz referencia a um campo utilizado anteriormente
      //os dois juntos garantem que o campo em questão tem o mesmo dado que o campo password
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field)

    })

    if (!(await schema.isValid(req.body))) return res.status(400).json({ error: "Validation fails" })
    const { email, oldPassword } = req.body
    console.log('AWWEE', req.userId)
    const user = await User.findByPk(req.userId);
    console.log(user)
    console.log('=>>>>>>>>', email)
    if (email !== user.email) {

      const userExist = await User.findOne({ where: { email: email } })
      if (userExist) return res.status(400).json({ error: "User already exist" })

    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: "Password does not match" })
    }

    const { id, name, provider } = await user.update(req.body)

    return res.json({
      id, name, email, provider
    })
  }
}

export default new UserController();
