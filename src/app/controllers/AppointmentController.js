import Appointment from "../models/appointment";
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'
import pt from 'date-fns/locale/pt'
import User from "../models/User";
import File from "../models/File";
import * as Yup from 'yup'
import Notification from "../schemas/Notification";

import Queue from "../../lib/Queue";

import CancellationMail from "../jobs/CancellationMail";
class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query
    const appointments = await Appointment.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancelable'],
      //cria paginacao de 20 em 20
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url']
            }
          ]
        }
      ]
    })
    res.json(appointments)
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' })
    }

    const { provider_id, date } = req.body
    /**
     * Checa se o provider_id é um provider
     */
    const checkIsProvider = await User.findOne({
      where: { id: provider_id, provider: true }
    })

    if (!checkIsProvider) {
      return res
        .status(401)
        .json({ error: 'Voce só pode criar um agendamento com usuarios que é provider' })
    }

    //verifica se o usuario e o mesmo fornecedor de serviço
    // if (req.userId === provider_id) {
    //   return res.status(401)
    //     .json({ error: 'Não é possivel realizar um agendamento com voce mesmo' })
    // }

    //check for past dates
    const hourStart = startOfHour(parseISO(date))

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Past dates are not permitted' })
    }

    //check date availability

    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id,
        canceled_at: null,
        date: hourStart,
      }
    })

    if (checkAvailability) {
      return res.status(400).json({ error: 'Appoint date is not available' })
    }
    const appointment = await Appointment.create({
      user_id: req.userId,
      provider_id,
      date
    })

    /**
     * Notify appointment provider
     */

    const user = await User.findByPk(req.userId)
    const formattedDate = format(
      hourStart,
      "'dia' dd 'de' MMMM', às' H:mm'h'",
      { locale: pt }
    )
    await Notification.create({
      content: `Novo agendamento de ${user.name} para ${formattedDate}`,
      user: provider_id
    });

    return res.json(appointment)
  }

  async delete(req, res) {

    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'user',
          attributes: ['name']
        }
      ]
    });

    if (appointment.user_id !== req.userId) {
      return res
        .status(401)
        .json({ error: "You dont have permiossio to cancel this appointment" })
    }

    //remove duas horas do horário do agendamento
    const dateWithSub = subHours(appointment.date, 2)

    if (isBefore(dateWithSub, new Date())) {
      return res
        .status(401)
        .json({ error: 'you can only cancel appoints 2 hours in advance' })
    }

    appointment.canceled_at = new Date()

    await appointment.save()

    await Queue.add(CancellationMail.key, {
      appointment,
    })

    return res.status(401).json(appointment)
  }
}

export default new AppointmentController();






     //TODO CRIAR MAIS AGENDAMENTOS PRA CONTINUAR OS TESTES
