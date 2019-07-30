import Photon from '@generated/photon'

const photon = new Photon()

async function main() {

  // Open connection to database
  await photon.connect()

  //   const newUser = await photon.users.create({
  //   data: {
  //     email: "koira@net.fi",
  //     username: "koira",
  //     name: "sika nauita"
  //   }
  // })
  // console.log(newUser)


  // const newEvent = await photon.events.create({
  //   data: {
  //     time: "10:00",
  //     title: "Testi",
  //     subtitle: "Subtitteli",
  //     date: new Date(),
  //     type: "Swimming",
  //     participants: {
  //       connect: { email: "koira@net.fi" }
  //     }
  //   }
  // })
  // console.log(newEvent)




  // const allUsers = await photon.users.findMany()
  // console.log(allUsers)

  const allEvents = await photon.events.findMany({
    include: {
      participants: true,
    }
  })
  allEvents.map((a) => {
    console.log(a);
  })


  // Close connection to database
  await photon.disconnect()
}

main()