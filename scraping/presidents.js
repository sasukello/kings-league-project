import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
import { json } from 'stream/consumers'

const STATIC_PATH = path.join(process.cwd(), './assets/static/presidents')
const DB_PATH = path.join(process.cwd(), './db/')
const RAW_PRESIDENTS = await readFile(`${DB_PATH}/raw-presidents.json`, 'utf-8').then(JSON.parse)


const presidents = await Promise.all(
    RAW_PRESIDENTS.map(async presidentInfo => {
        const { slug: id, title, _links: link } = presidentInfo
        const { rendered: name } = title
        const { 'wp:attachment': attachment } = link
        const { href: imageApiEndpoint } = attachment[0]

        console.log(`> Fetching attachment for president: ${name}`)

        const responseImageEndpoint = await fetch(imageApiEndpoint)
        const data = await responseImageEndpoint.json()
        const [imageInfo] = data
        const { guid: { rendered: imageUrl } } = imageInfo
        //recuperar extension de la imagen
        const fileExtension = imageUrl.split('.').at(-1)

        console.log(`> fetching image for president: ${name}`)

        //fetch the image and save it to the file system
        const responseImage = await fetch(imageUrl)
        //el arrayBuffer descarga la imagen o informacion en binario
        const arrayBuffer = await responseImage.arrayBuffer()
        const buffer = Buffer.from(arrayBuffer)

        console.log(`> Writing image to disk ${name}`)

        const imageFilename = `${id}.${fileExtension}`
        await writeFile(`${STATIC_PATH}/${imageFilename}`, buffer)

        console.log(`> Everything is done! ${name}`)


        return { id, name, image: imageFilename, teamId: 0 }

    })
)
console.log(`> All president are Done!!! `)
await writeFile(`${DB_PATH}/presidents.json`, JSON.stringify(presidents, null))
