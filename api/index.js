import { Hono } from 'hono';
import { serveStatic } from 'hono/serve-static.module'
import leaderboard from '../db/leaderboard.json'
import teams from '../db/teams.json'
import presidents from '../db/presidents.json'


const app = new Hono()

app.get('/', (ctx) => ctx.json([
	{
		endpoint: '/leaderboard',
		descriptio: 'Return Kings League leaderboard'

	},
	{
		endpoint: '/teams',
		descriptio: 'Return Kings League teams'

	},
	{
		endpoint: '/presidents',
		descriptio: 'Return Kings League presidents'

	}
]))

app.get('/leaderboard', (ctx) => {
	return ctx.json(leaderboard)
})

app.get('/presidents', (ctx) => {
	return ctx.json(presidents)
})
app.get('/presidents/:id', (ctx) => {
	const id = ctx.req.param('id')
	const foundPresident = presidents.find(presidents => presidents.id === id)
	return foundPresident
		? ctx.json(foundPresident)
		: ctx.json({ message: 'President not found' }, 404)
})

app.get('/teams', (ctx) => {
	return ctx.json(teams)
})

app.get('/teams/:id', (ctx) => {
	const id = ctx.req.param('id')
	const foundTeam = teams.find(teams => teams.id === id)
	return foundTeam
		? ctx.json(foundTeam)
		: ctx.json({ message: 'Team not found' }, 404)
})

app.get('/static/*', serveStatic({ root: './' }))

export default app