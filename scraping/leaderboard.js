//esta libreria se utiliza para trabajar la pagina web obtenida del scraping
import * as cheerio from 'cheerio'
import { writeFile, readFile } from 'node:fs/promises'
import path from 'node:path'
const DB_PATH = path.join(process.cwd(), './db/')
const TEAMS = await readFile(`${DB_PATH}/teams.json`, 'utf-8').then(JSON.parse)
//import teams from '../db/teams.json' assert { type: 'json'}


const URLS = {
    leaderboard: 'https://kingsleague.pro/estadisticas/clasificacion/'
}

async function scrape(url) {
    const res = await fetch(url)
    const html = await res.text()
    return cheerio.load(html)

}
async function getLeaderBoard() {
    const $ = await scrape(URLS.leaderboard)
    //se obtiene el valor de una tabla de la pagina en una variable de cheerio
    const $rows = $('table tbody tr')

    //esta constante se puede modificar , si llega a cambiar los selectores de la tabla 
    const LEADERBOARD_SELECTOR = {
        team: { selector: '.fs-table-text_3', typeOf: 'string' },
        wins: { selector: '.fs-table-text_4', typeOf: 'number' },
        loses: { selector: '.fs-table-text_5', typeOf: 'number' },
        scoredGoals: { selector: '.fs-table-text_6', typeOf: 'number' },
        concededGoals: { selector: '.fs-table-text_7', typeOf: 'number' },
        yellowCards: { selector: '.fs-table-text_8', typeOf: 'number' },
        redCards: { selector: '.fs-table-text_9', typeOf: 'number' }
    }

    const getTeamFrom = ({ name }) => TEAMS.find(team => team.name === name)

    const cleanText = text => text
        .replace(/\t|\n|\s:/g, '')
        .replace(/.*:/g, ' ')
        .trim()


    const leaderBoardSelectorEntries = Object.entries(LEADERBOARD_SELECTOR)

    const leaderboard = []
    $rows.each((index, el) => {
        const $el = $(el)
        const leaderBoardEntries = leaderBoardSelectorEntries.map(([key, { selector, typeOf }]) => {
            const rawValue = $el.find(selector).text()
            const cleanedValue = cleanText(rawValue)

            const value = typeOf === 'number' ? Number(cleanedValue) : cleanedValue
            return [key, value]
        })

        const { team: teamName, ...leaderboardForTeam } = Object.fromEntries(leaderBoardEntries)
        const team = getTeamFrom({ name: teamName })
        leaderboardForTeam.teamId = getTeamFrom(leaderboardForTeam)

        leaderboard.push({
            ...leaderboardForTeam,
            team
        })
    })
    return leaderboard

}
const leaderboard = await getLeaderBoard()

await writeFile(`${DB_PATH}/leaderboard.json`, JSON.stringify(leaderboard, null, 2), 'utf-8')