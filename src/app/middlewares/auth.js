import jwt from "jsonwebtoken";
import { promisify } from 'util'
import authConfig from '../../config/auth'

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return res.status(401).json({ error: 'token not provided' })
  //coisa linda! ele descarta a posição 0 do array retornado do split
  //pegando só a segunda que é o que interessa
  //obs: authHeader vem bearer: asdkasopkdaspodkas
  const [, token] = authHeader.split(' ');

  try {
    //verifica o jwt e decodifica ele retornando o id e o tempo de expiração
    const decoded = await promisify(jwt.verify)(token, authConfig.secret)
    //insere o id do usuário que ele encontrou no token dentro da requisição
    //evita que o frontend fique mandando essa informação
    //ja que a mesma está presente no token jwt
    req.userId = decoded.id
    return next()
  } catch (err) {
    return res.status(401).json({ error: 'Token is invalid' })
  }

}
