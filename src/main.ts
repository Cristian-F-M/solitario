declare global {
	var newGameboard: Gameboard
}

const CARD_WIDTH = 70
const CARD_ASPECT_RATIO = 1.4
const CARD_HEIGHT = CARD_WIDTH * CARD_ASPECT_RATIO
const CARD_INDICATOR_HEIGHT = 30
const CARD_ZONES = 7
const MOVING_CARD_DURATION = 200
const ENDING_ANIMATED_CARD_DURATION = 1800
const INDICATOR_POSITIONS: IndicatorPosition[] = ['top', 'middle', 'bottom']
const INDICATOR_EDGE_SVG_SIZE = CARD_WIDTH * 0.12
const INDICATOR_MIDDLE_SVG_SIZE = CARD_WIDTH * 0.4
const ZONE_WIDTH = CARD_WIDTH * 1.1
const ZONE_HEIGHT = CARD_HEIGHT * 1.1
const FOUNDATION_HEIGHT = CARD_HEIGHT * 1.05
const FOUNDATION_WIDTH = CARD_WIDTH * 1.05
const LAST_CARD_NUMBER = 13
const STACK_TURNS = 15
let provitionalSettings: Settings = {
	difficulty: 'easy',
	isTimerActive: true,
	isMovementsCounterActive: true
}

const $cardsStack = $('#cards-stack') as HTMLDivElement
const $cardsFoundations = $('#cards-foundations') as HTMLDivElement
const $zones = $('#zones') as HTMLDivElement
const $cardsContainer = $('#cards-container') as HTMLDivElement
const $timeContainer = $('#time-container') as HTMLDivElement
const $redoButton = $('#redo') as HTMLButtonElement
const $undoButton = $('#undo') as HTMLButtonElement
const $actionsContainer = $('#actions-container') as HTMLDivElement
const $difficultyOptions = $('#difficulty-options') as HTMLDivElement
const $difficulties = $difficultyOptions.querySelectorAll(
	'.difficulty-card'
) as NodeListOf<HTMLDivElement>
const $toggleTimerContainer = $('#toggle-timer--container') as HTMLDivElement
const $toggleMovementsCounterContainer = $('#toggle-movements-counter--container') as HTMLDivElement
const $inputTimer = $toggleTimerContainer.querySelector('input') as HTMLInputElement
const $inputMovementsCounter = $toggleMovementsCounterContainer.querySelector(
	'input'
) as HTMLInputElement
const $playButton = $('#play-button') as HTMLButtonElement
const $newGameButton = $('#new-game-button') as HTMLButtonElement
const $closeModalButtons = $$('dialog button.close-button') as NodeListOf<HTMLButtonElement>
const $counterContainer = $('#counters-container') as HTMLDivElement
const $movementsContainer = $('#movements-container') as HTMLDivElement
const $movementsCount = $('#movements-count') as HTMLDivElement
const $difficultyDescriptionsContainer = $('.difficulty-descriptions-container') as HTMLDivElement
const $difficultyBadgeIndicator = $('.difficulty-badge-indicator') as HTMLDivElement
const $remainingStackTurns = $('#remaining-stack-turns') as HTMLDivElement
const $remainingStackTurnsText = $('#remaining-stack-turns-text') as HTMLSpanElement
const $pauseButton = $('#pause-button') as HTMLButtonElement
const $dialogs = $$('dialog') as NodeListOf<HTMLDialogElement>
const $statsDifficultyBadgeIndicator = $('#stats-difficulty-badge-indicator') as HTMLDivElement
const $statsTimerCheckbox = $('#stats-timer-checkbox') as HTMLDivElement
const $statsMovementsCheckbox = $('#stats-movements-checkbox') as HTMLDivElement
const $statsUndoRedoCheckbox = $('#stats-undo-redo-checkbox') as HTMLDivElement
const $statsFoundationsCards = $('#stats-foundations-cards') as HTMLSpanElement
const $statsStackCards = $('#stats-stack-cards') as HTMLSpanElement
const $continuePlayingButton = $('#continue-playing-button') as HTMLButtonElement
const $restartPlayingButton = $('#restart-playing-button') as HTMLButtonElement
const $pausedMovementsCount = $('#paused-movements-count') as HTMLDivElement
const $pausedTimeCount = $('#paused-time-count') as HTMLDivElement
const $winMovementsCount = $('#win-movements-count') as HTMLDivElement
const $winTimeCount = $('#win-time-count') as HTMLDivElement
const $winDifficultyBadgeIndicator = $('#win-difficulty-badge-indicator') as HTMLDivElement
const $winTimerCheckbox = $('#win-timer-checkbox') as HTMLDivElement
const $playAgainButton = $('#play-again-button') as HTMLButtonElement
const $omitButton = $('#omit-button') as HTMLButtonElement
const $showCardFromStack = $('#show-card-from-stack') as HTMLDivElement

interface Movement {
	id: string
	from: {
		id: string
		zone: Zones
	}
	to: {
		id: string
		zone: Zones
	}
	cards: CardId[]
	flippedLastCard?: boolean
}

interface Settings {
	difficulty: Difficulties
	isTimerActive: boolean
	isMovementsCounterActive: boolean
}

type Movements = Movement[]

type IndicatorPosition = 'top' | 'middle' | 'bottom'
type Deck = 'diamonds' | 'clubs' | 'hearts' | 'spades'
type CardColor = 'red' | 'black'
type Zones = keyof Pick<States['gameboard'], 'stacked' | 'showed'> | 'card' | 'foundation' | 'zone'
type Difficulties = 'easy' | 'hard'
type GameboardKeys = keyof States['gameboard']
type SoundId = keyof typeof SOUNDS

interface Card {
	id: string
	deck: Deck
	number: number
	flipped: boolean
	color: CardColor
	zoneId: string
	stacked: boolean
	showed: boolean
	zone: Zones
}

type CardId = Pick<Card, 'id'>

interface Zone {
	zone: Zones
	id: string
	cards: CardId[]
	index: number
}

interface StackedZone extends Pick<Zone, 'id' | 'cards' | 'zone'> {
	zone: 'stacked'
}

interface ShowedZone extends Omit<StackedZone, 'zone'> {
	zone: 'showed'
}

interface Gameboard {
	cards: Card[]
	stacked: StackedZone
	showed: ShowedZone
	zones: Record<string, Zone>
	foundations: Record<string, Foundation>
	movements: Movements
	redoMovements: Movements
}

type Foundation = Pick<Zone, 'id' | 'cards'> & { deck: Deck }

interface States {
	playing: boolean
	offset: { x: number; y: number }
	previouseZoneId: string | undefined
	currentCards: HTMLDivElement[]
	dragging: boolean
	gameboard: Gameboard
	initialGameboard: Gameboard | null
	time: {
		time: number
		interval: null | NodeJS.Timeout
	}
	isFirstMoveMade: boolean
	remainingStackTurns: number
	omitAnimation: boolean
	settings: Settings
}

const STATES: States = {
	playing: false,
	offset: {
		x: 0,
		y: 0
	},
	previouseZoneId: undefined,
	currentCards: [],
	dragging: false,
	gameboard: {
		cards: [],
		stacked: {
			zone: 'stacked',
			id: 'stacked',
			cards: []
		},
		showed: {
			zone: 'showed',
			id: 'showed',
			cards: []
		},
		zones: {},
		foundations: {},
		movements: [],
		redoMovements: []
	},
	initialGameboard: null,
	time: {
		time: 0,
		interval: null
	},
	isFirstMoveMade: false,
	settings: {
		difficulty: 'easy',
		isTimerActive: true,
		isMovementsCounterActive: true
	},
	remainingStackTurns: STACK_TURNS,
	omitAnimation: false
}

const DECKS: Deck[] = ['diamonds', 'clubs', 'hearts', 'spades']
const FIGURES: Record<string, string> = {
	'1': 'A',
	'11': 'J',
	'12': 'Q',
	'13': 'K'
}

const CARD_STATE = {
	width: CARD_WIDTH,
	aspectRatio: 1.4,
	height: CARD_WIDTH * CARD_ASPECT_RATIO,
	indicatorHeight: 30,
	indicatorEdgeSvgSize: CARD_WIDTH * 0.12,
	indicatorMiddleSvgSize: CARD_WIDTH * 0.4,
	zonePaddingY: ZONE_HEIGHT - CARD_HEIGHT,
	zoneWidth: CARD_WIDTH * 1.1,
	zoneHeight: CARD_HEIGHT * 1.1,
	foundationHeight: CARD_HEIGHT * 1.05,
	foundationWidth: CARD_WIDTH * 1.05
}

const SOUNDS = {
	'show-card-from-stack': getSound('flip.ogg'),
	'card-flip': getSound('card-flip.wav'),
	'card-placement': getSound('card-placement.wav'),
	'show-card': getSound('show-card.mp3'),
	'paper-rip': getSound('broken-branches.mp3'),
	victory: getSound('victory.m4a'),
	music: getSound('jazz-music.mp3')
}

function getSound(fileName: string) {
	return new Audio(`./sounds/${fileName}`)
}

function createResetStackElement() {
	const resetStackElement = document.createElement('div')
	const reloadIcon = createSVGIcon('reload')

	resetStackElement.setAttribute('id', 'reset-stack')
	resetStackElement.appendChild(reloadIcon)

	resetStackElement.addEventListener('click', handleResetStack)
	resetStackElement.addEventListener('touchend', handleResetStack)

	return resetStackElement
}

function createSVGIcon(iconId: string) {
	const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')
	const use = document.createElementNS('http://www.w3.org/2000/svg', 'use')

	use.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', `./icons.svg#${iconId}`)
	svg.appendChild(use)

	return svg
}

function $(sel: string) {
	return document.querySelector(sel)
}

function $$(sel: string) {
	return document.querySelectorAll(sel)
}

function getStackCoors(side: 'stack' | 'show', i?: number) {
	const { xsQuery } = getMatchMediaQuery()
	const cardStackPadding = xsQuery.matches ? 15 : 30
	const maxStackIndex = 2
	const stackSeparatorSpace = xsQuery.matches ? 3 : 6
	const minWidthCardsStack = CARD_STATE.width * 2 + cardStackPadding * 3
	const minHeightCardsStack = CARD_STATE.height + 10 * 2
	const rect = $cardsStack.getBoundingClientRect()
	const isStack = side === 'stack'
	let totalWidthSpace = rect.width
	let totalHeightSpace = rect.height

	if (!$cardsStack) return { x: 0, y: 0, stackSeparatorSpace, maxStackIndex }

	if (rect.width < minWidthCardsStack) {
		$cardsStack.style.width = `${minWidthCardsStack}px`
		totalWidthSpace = minWidthCardsStack
	}

	if (rect.height < minHeightCardsStack) {
		$cardsStack.style.height = `${minHeightCardsStack}px`
		totalHeightSpace = minHeightCardsStack
	}

	const totalSeparationSpace = totalWidthSpace - CARD_STATE.width * 2
	const betweenSpaceMultiplier = 0.5
	const paddingSpaceMultiplier = (1 - betweenSpaceMultiplier) / 2
	const betweenSpace = totalSeparationSpace * betweenSpaceMultiplier
	const paddingSpace = totalSeparationSpace * paddingSpaceMultiplier
	const y = rect.top + window.scrollY + (totalHeightSpace - CARD_STATE.height) / 2
	let x = paddingSpace + rect.left + window.scrollX

	if (isStack && i) {
		if (i <= maxStackIndex) x += i * stackSeparatorSpace
		if (i > maxStackIndex) x += maxStackIndex * stackSeparatorSpace
	}

	if (!isStack) x = x + betweenSpace + CARD_STATE.width

	return { x, y, stackSeparatorSpace, maxStackIndex }
}

function createCardElement({ id, number, deck }: { id: string; number: number; deck: Deck }) {
	if (number <= 0 || number > LAST_CARD_NUMBER) throw new Error(`Invalid card number ${number}`)
	if (!DECKS.includes(deck)) throw new Error('Invalid deck')

	const cardContainer = document.createElement('div')
	const card = document.createElement('div')
	const frontFace = document.createElement('div')
	const backFace = document.createElement('div')

	for (const position of ['top', 'bottom']) {
		const logo = createSVGIcon('logo')
		const indicator = document.createElement('div')

		indicator.classList.add('back-face-card-indicator')
		indicator.classList.add(`back-face-card-indicator-${position}`)
		indicator.appendChild(logo)

		backFace.appendChild(indicator)
	}

	cardContainer.classList.add('card-container')
	cardContainer.setAttribute('id', id)
	card.classList.add('card')
	frontFace.classList.add('card-face', 'card-front-face')
	backFace.classList.add('card-face', 'card-back-face')

	card.appendChild(frontFace)
	card.appendChild(backFace)

	cardContainer.addEventListener('mousedown', handleMouseDown)
	cardContainer.addEventListener('touchstart', handleMouseDown)
	cardContainer.addEventListener('mouseup', handleMouseUp)
	cardContainer.addEventListener('touchend', handleMouseUp)

	cardContainer.setAttribute('data-flipped', 'false')
	cardContainer.appendChild(card)

	return cardContainer
}

function handleMouseDown(event: MouseEvent | TouchEvent) {
  console.log({ play: STATES.playing })
  
	if (!STATES.playing) return

	if (!STATES.isFirstMoveMade) {
		if (STATES.settings.isTimerActive) startTimer()

		if (STATES.settings.isMovementsCounterActive) updateMovementsCounterUI()

		STATES.isFirstMoveMade = true
	}

	const card = event.currentTarget as HTMLDivElement
	const cardData = getCardData({ card })
	const zoneId = card.dataset.zoneId

	let [clientX, clientY] = [0, 0]

	if (event instanceof MouseEvent) {
		;[clientX, clientY] = [event.clientX, event.clientY]
	}

	if (event instanceof TouchEvent) {
		const touch = event.changedTouches[0]
		if (touch) [clientX, clientY] = [touch.clientX, touch.clientY]
	}

	// 🔹 Early returns
	if (!cardData) return
	if (card.classList.contains('moving-card')) return
	if ((cardData.stacked && !cardData.showed) || !cardData.flipped) return

	const currentZone = cardData.zone
	const currentCards: HTMLDivElement[] = []

	// 🔹 Calcular offset de arrastre
	const rect = card.getBoundingClientRect()
	STATES.offset = {
		x: clientX - rect.left,
		y: clientY - rect.top
	}

	// 🔹 Funciones auxiliares
	const addCard = (c: HTMLDivElement) => currentCards.push(c)

	const getZoneCards = (zoneId: string, cardId: string) => {
		const zoneData = STATES.gameboard.zones[zoneId]
		if (!zoneData) return { after: [], before: [] }
		const cards = zoneData.cards
		const cardIndex = cards.findIndex((c) => c.id === cardId)
		return {
			before: cards.slice(0, cardIndex),
			after: cards.slice(cardIndex).map((c) => document.getElementById(c.id) as HTMLDivElement)
		}
	}

	// 🔹 Selección según zona
	if (cardData.stacked && cardData.showed) {
		addCard(card)
	}

	if (currentZone === 'zone' && zoneId) {
		const { after } = getZoneCards(zoneId, cardData.id)
		if (after.length > 0) currentCards.push(...after)
	}

	if (currentZone === 'foundation') {
		addCard(card)
	}

	// 🔹 Aplicar estilos a cartas seleccionadas
	for (const [index, c] of currentCards.entries()) {
		c.classList.add('dragging-card')
		if (index > 0) c.style.pointerEvents = 'none'
	}

	// 🔹 Guardar en estado global
	STATES.currentCards = currentCards
	STATES.dragging = true
	STATES.previouseZoneId = zoneId
}

function handleMouseUp(event: MouseEvent | TouchEvent) {
	event.preventDefault()

	if (!STATES.playing) return

	const card = event.currentTarget as HTMLDivElement
	const cardData = getCardData({ card })
	const currentCards = STATES.currentCards

	// 🔹 Early returns más compactos
	if (!cardData || (cardData.stacked && !cardData.showed)) return

	let [clientX, clientY] = [0, 0]

	if (event instanceof MouseEvent) {
		;[clientX, clientY] = [event.clientX, event.clientY]
	}

	if (event instanceof TouchEvent) {
		const touch = event.changedTouches[0]
		// debugger;
		if (touch) [clientX, clientY] = [touch.clientX, touch.clientY]
	}

	const elementBelow = getElementUnderCard({
		card,
		x: clientX,
		y: clientY
	}) as HTMLDivElement | null
	if (!elementBelow) return

	// 🔹 Reset de estados globales
	STATES.currentCards = []
	STATES.dragging = false
	STATES.previouseZoneId = ''

	card.classList.remove('dragging-card')

	const currentCardZone = cardData.zone
	const currentCardZoneId = cardData.zoneId
	const elementBelowIsCard = elementBelow.classList.contains('card-container')

	const belowZone = (elementBelow.dataset.zone || '') as Zones
	const belowZoneId = elementBelow.getAttribute('id') || ''
	const zoneId = elementBelow.getAttribute('data-zone-id') || ''
	const targetId = elementBelowIsCard ? zoneId : belowZoneId

	const VALID_ZONES = ['zone', 'foundation']
	const isSomeZone = VALID_ZONES.includes(belowZone)

	let isFirstCardValid = false

	// 🔹 Función auxiliar para restaurar
	const restore = (card: HTMLDivElement) =>
		restoreCardPosition({ card, zone: currentCardZone, zoneId: currentCardZoneId })

	for (const [index, cardEl] of currentCards.entries()) {
		cardEl.classList.remove('dragging-card')
		cardEl.classList.add('moving-card')
		cardEl.style.pointerEvents = 'auto'
		setTimeout(() => cardEl.classList.remove('moving-card'), MOVING_CARD_DURATION)

		const childCardData = getCardData({ card: cardEl })
		if (!childCardData) continue

		if (!isSomeZone) {
			restore(cardEl)
			continue
		}

		let isValidCard = false
		if (belowZone === 'zone') {
			const zoneData = STATES.gameboard.zones[targetId]
			if (zoneData) {
				isValidCard = getIsValidCard({ cardData: childCardData, zoneData })
				if (index === 0) isFirstCardValid = isValidCard
				if (isValidCard && isFirstCardValid) {
					zoneData.cards.push({ id: childCardData.id })
					updateZoneSize({ zoneId: targetId })
				}
			}
		}

		if (belowZone === 'foundation') {
			const foundationData = STATES.gameboard.foundations[targetId]
			if (foundationData) {
				isValidCard = getIsValidCard({ cardData: childCardData, zoneData: foundationData })
				if (index === 0) isFirstCardValid = isValidCard
				if (isValidCard && isFirstCardValid) foundationData.cards.push({ id: childCardData.id })
			}
		}

		// 🔹 Validaciones comunes
		if (index === 0) isFirstCardValid = isValidCard
		if (!isValidCard || !isFirstCardValid) {
			restore(cardEl)
			continue
		}

		// 🔹 Mover carta y actualizar datos
		const { x, y } = getZoneCoords(targetId)
		moveCard({ card: cardEl, x, y })

		childCardData.zone = belowZone
		childCardData.zoneId = targetId
		childCardData.stacked = false
		childCardData.showed = false

		updateCardElement({ card: cardEl, cardData: childCardData })

		// 🔹 Quitar del origen
		if (currentCardZone === 'stacked') STATES.gameboard.stacked.cards.pop()
		if (currentCardZone === 'showed') {
			STATES.gameboard.showed.cards.pop()
			// cardEl.removeEventListener('click', handleClick)
		}
		if (currentCardZone === 'foundation') {
			STATES.gameboard.foundations[currentCardZoneId]?.cards.pop()
		}
	}

	if (!isFirstCardValid) return

	// 🔹 Ajustar cartas sobrantes en la zona origen
	if (currentCardZone === 'zone') {
		const zoneData = STATES.gameboard.zones[currentCardZoneId]
		if (zoneData && isFirstCardValid) {
			const cards = zoneData.cards
			const cardIndex = cards.findIndex((c) => c.id === cardData.id)
			if (cardIndex !== -1) zoneData.cards = cards.slice(0, cardIndex)
		}
	}

	// 🔹 Voltear última carta de la zona origen
	const zoneData = STATES.gameboard.zones[currentCardZoneId]
	const fromZoneLastCardIsFlipped = getIsLastCardFlipped({ zoneData })

	if (zoneData) {
		flipLastCard({ zoneData })
		updateZoneSize({ zoneId: currentCardZoneId })
	}

	addMovement({
		from: {
			id: currentCardZoneId,
			zone: currentCardZone
		},
		to: {
			id: targetId,
			zone: belowZone
		},
		cards: currentCards.map((c) => ({
			id: c.id
		})),
		flippedLastCard: fromZoneLastCardIsFlipped
	})
	setRedoMovements([])
	playSound({ id: 'card-placement' })

	const isGameWon = getIsGameWon()
	if (isGameWon) handleGameWon()

	console.log(STATES.gameboard)
}


function handleMouseMove(event: MouseEvent | TouchEvent) {
	if (!STATES.playing || !STATES.dragging || STATES.currentCards.length === 0) return
	const isPrimaryButtonPressed = event instanceof MouseEvent ? event.buttons === 1 : true
	const currentCards = STATES.currentCards
	const firstCard = currentCards[0]

	if (!firstCard) return

	const firstCardIndex = Number(firstCard.style.getPropertyValue('--index')) - 1
	const firstCardData = getCardData({ card: firstCard })

	if (!firstCardData) return

	const firstCardZone = firstCardData.zone
	const zoneData = STATES.gameboard.zones[firstCardData.zoneId]

	if (zoneData) {
		const cards = zoneData.cards
		const cardIndex = cards.findIndex((c) => c.id === firstCardData.id)
		updateZoneSize({ zoneId: zoneData.id, cards: cards.slice(0, cardIndex) })
	}

	let [clientX, clientY] = [0, 0]

	if (event instanceof MouseEvent) {
		;[clientX, clientY] = [event.clientX, event.clientY]
	}

	if (event instanceof TouchEvent) {
		const touch = event.changedTouches[0]
		if (touch) [clientX, clientY] = [touch.clientX, touch.clientY]
	}

	// Obtener `x` y `y`
	const x = clientX - STATES.offset.x + window.scrollX
	let y = clientY - STATES.offset.y + window.scrollY

	if (firstCardIndex && firstCardZone && firstCardZone === 'zone') {
		y -= firstCardIndex * CARD_STATE.indicatorHeight
	}

	if (!isPrimaryButtonPressed) {
		STATES.currentCards = []
		STATES.dragging = false
		STATES.previouseZoneId = ''
	}

	for (const card of currentCards) {
		if (!isPrimaryButtonPressed) {
			card.classList.remove('dragging-card')
			const cardData = getCardData({ card })

			if (!cardData) return

			restoreCardPosition({
				card,
				zone: cardData.zone,
				zoneId: cardData.zoneId
			})
			continue
		}

		card.classList.remove('moving-card')
		card.classList.add('dragging-card')

		card.style.setProperty('--x', `${x}px`)
		card.style.setProperty('--y', `${y}px`)
	}
}

function handleMouseLeave() {
	const currentCards = STATES.currentCards

	for (const card of currentCards) {
		card.classList.remove('dragging-card')
		const cardData = getCardData({ card })

		if (!cardData) continue

		restoreCardPosition({
			card,
			zone: cardData.zone,
			zoneId: cardData.zoneId
		})
	}

	STATES.dragging = false
	STATES.currentCards = []
	STATES.previouseZoneId = undefined
}

function handleDoubleClick(event: MouseEvent | TouchEvent) {
	if (!STATES.playing) return

	const card = event.currentTarget as HTMLDivElement
	const cardData = getCardData({ card })

	// 🔹 Early exits
	if (!cardData || !cardData.flipped) return
	if (card.classList.contains('showing-card')) return

	const currentZone = cardData.zone
	const currentZoneId = cardData.zoneId

	// 🔹 Helpers
	const removeFromOrigin = () => {
		if (currentZone === 'showed') STATES.gameboard.showed.cards.pop()
		if (currentZone === 'zone') STATES.gameboard.zones[currentZoneId]?.cards.pop()
		if (currentZone === 'foundation') STATES.gameboard.foundations[currentZoneId]?.cards.pop()
	}

	const applyMove = (
		targetZone: Extract<Zones, 'zone' | 'foundation'>,
		targetZoneId: string,
		zoneData: Zone | Foundation
	) => {
		const { x, y } = getZoneCoords(targetZoneId)
		moveCard({ card, x, y })
		playSound({ id: 'card-placement' })

		cardData.zone = targetZone
		cardData.zoneId = targetZoneId
		cardData.stacked = false
		cardData.showed = false

		zoneData.cards.push({ id: cardData.id })
		updateCardElement({ card, cardData })
		updateZoneSize({ zoneId: currentZoneId })
		if (targetZone === 'zone') updateZoneSize({ zoneId: targetZoneId })
	}

	// 🔹 Caso: mover As (1) a foundation
	if (cardData.number === 1) {
		const foundationEntry = Object.entries(STATES.gameboard.foundations).find(
			([, foundation]) => cardData.deck === foundation.deck
		)
		if (!foundationEntry) return

		const [, foundationData] = foundationEntry
		if (!foundationData || cardData.zoneId === foundationData.id) return

		removeFromOrigin()
		applyMove('foundation', foundationData.id, foundationData)
		const zoneData = STATES.gameboard.zones[currentZoneId]

		if (zoneData) flipLastCard({ zoneData })

		const isLastCardFlipped = getIsLastCardFlipped({ zoneData })

		addMovement({
			from: {
				id: currentZoneId,
				zone: currentZone
			},
			to: {
				id: foundationData.id,
				zone: 'foundation'
			},
			cards: [{ id: cardData.id }],
			flippedLastCard: isLastCardFlipped
		})
		setRedoMovements([])
		return
	}

	// 🔹 Caso: mover Rey (13) a una zona vacía
	if (cardData.number === 13) {
		const currentZoneData = STATES.gameboard.zones[currentZoneId]
		if (!currentZoneData) return

		const zoneEntry = Object.entries(STATES.gameboard.zones).find(
			([, zone]) => zone.cards.length === 0
		)
		if (!zoneEntry) return

		const [, zoneData] = zoneEntry
		currentZoneData.cards.pop()
		applyMove('zone', zoneData.id, zoneData)

		const lastCardInZone = currentZoneData?.cards.at(-1)
		const fromZoneLastCardData = getCardDataById({ id: lastCardInZone?.id ?? '' })
		const isLastCardFlipped = fromZoneLastCardData?.flipped ?? false

		addMovement({
			from: {
				id: currentZoneId,
				zone: currentZone
			},
			to: {
				id: zoneData.id,
				zone: 'zone'
			},
			cards: [{ id: cardData.id }],
			flippedLastCard: isLastCardFlipped
		})
		setRedoMovements([])
		return
	}

	// 🔹 Caso: mover carta intermedia dentro de zona
	if (currentZone === 'zone') {
		const zoneData = STATES.gameboard.zones[currentZoneId]
		if (!zoneData) return

		const cards = zoneData.cards
		const cardIndex = cards.findIndex((c) => c.id === cardData.id)
		const cardsToMove = cards.slice(cardIndex)

		const targetCard = STATES.gameboard.cards.find(
			(c) =>
				c.color !== cardData.color &&
				c.number === cardData.number + 1 &&
				c.flipped &&
				!c.stacked &&
				c.zoneId !== currentZoneId
		)
		if (!targetCard) return

		const targetZoneId = targetCard.zoneId
		const targetZoneData = STATES.gameboard.zones[targetZoneId]
		if (!targetZoneData) return

		if (!getIsValidCard({ cardData, zoneData: targetZoneData })) return

		zoneData.cards = cards.slice(0, cardIndex)
		const { x, y } = getZoneCoords(targetZoneId)

		for (const c of cardsToMove) {
			const childData = getCardDataById({ id: c.id })
			const $child = document.getElementById(c.id) as HTMLDivElement
			if (!childData || !$child) continue

			targetZoneData.cards.push({ id: childData.id })

			moveCard({ card: $child, x, y })
			childData.zone = 'zone'
			childData.zoneId = targetZoneId
			childData.stacked = false
			childData.showed = false

			updateCardElement({ card: $child, cardData: childData })
			updateZoneSize({ zoneId: currentZoneId })
			updateZoneSize({ zoneId: targetZoneId })
			playSound({ id: 'card-placement' })
		}

		// 🔹 Voltear la última carta de la zona de origen
		flipLastCard({ zoneData })

		const isLastCardFlipped = getIsLastCardFlipped({ zoneData })

		addMovement({
			from: {
				id: currentZoneId,
				zone: currentZone
			},
			to: {
				id: targetZoneId,
				zone: 'zone'
			},
			cards: cardsToMove.map((c) => ({ id: c.id })),
			flippedLastCard: isLastCardFlipped
		})
		setRedoMovements([])

		return
	}

	// 🔹 Caso: mover desde showed hacia otra carta
	if (currentZone === 'showed') {
		const targetCard = STATES.gameboard.cards.find(
			(c) =>
				c.color !== cardData.color && c.number === cardData.number + 1 && c.flipped && !c.stacked
		)
		if (!targetCard) return

		const targetZoneId = targetCard.zoneId
		const targetZoneData = STATES.gameboard.zones[targetZoneId]
		if (!targetZoneData) return

		if (!getIsValidCard({ cardData, zoneData: targetZoneData })) return

		STATES.gameboard.showed.cards.pop()
		applyMove('zone', targetZoneId, targetZoneData)

		addMovement({
			from: {
				id: currentZoneId,
				zone: currentZone
			},
			to: {
				id: targetZoneId,
				zone: 'zone'
			},
			cards: [{ id: cardData.id }]
		})
		setRedoMovements([])
	}
}

function createCard({
	id,
	zoneId,
	number,
	deck
}: {
	id?: string
	zoneId?: string
	number: number
	deck: Deck
}) {
	if (!id) id = getUIID()
	const card = createCardElement({ id, number, deck })

	const cardData: Card = {
		id,
		number,
		deck,
		color: getCardColor(deck),
		flipped: false,
		zoneId: zoneId ?? 'null',
		stacked: false,
		showed: false,
		zone: 'stacked'
	}

	return { card, cardData }
}

function createCardIndicator(position: IndicatorPosition, number: number, deck: Deck) {
	const indicator = document.createElement('div')
	const logo = createSVGIcon(deck)
	indicator.classList.add('front-face-card-indicator')

	if (['top', 'middle', 'bottom'].includes(position)) {
		indicator.classList.add(`front-face-card-indicator-${position}`)
	}

	if (['top', 'bottom'].includes(position)) {
		const span = document.createElement('span')
		span.textContent = `${FIGURES[number] ?? number}`
		indicator.appendChild(span)
		indicator.appendChild(logo)
	}

	if (['diamonds', 'hearts'].includes(deck)) {
		indicator.classList.add('red')
	}

	if (['clubs', 'spades'].includes(deck)) {
		indicator.classList.add('black')
	}

	if (position === 'middle') {
		indicator.appendChild(logo)
	}
	return indicator
}

function moveCard({ card, x, y }: { card: HTMLDivElement; x: number; y: number }) {
	if (!card) return

	card.classList.add('moving-card')
	card.style.setProperty('--x', `${x}px`)
	card.style.setProperty('--y', `${y}px`)

	setTimeout(() => {
		card.classList.remove('moving-card')
	}, MOVING_CARD_DURATION)
}

function getIsValidCard({ cardData, zoneData }: { cardData: Card; zoneData: Zone | Foundation }) {
	const cards = zoneData.cards
	const isEmptyZone = cards.length === 0
	const isZone = 'zone' in zoneData && zoneData.zone === 'zone'
	const isFoundation = !isZone && 'deck' in zoneData
	const lastCard = cards[cards.length - 1]

	const lastCardData = getCardDataById({ id: lastCard?.id ?? '' })

	if (isFoundation) {
		if (cardData.deck !== zoneData.deck) return false
		if (isEmptyZone && cardData.number === 1) return true
		if (!lastCard || !lastCardData) return false
		if (lastCardData.deck !== cardData.deck) return false
		if (lastCardData.number + 1 !== cardData.number) return false

		return true
	}

	if (isZone) {
		if (cardData.zoneId === zoneData.id) return false

		if (isEmptyZone && cardData.number === LAST_CARD_NUMBER) return true
		if (!lastCard || !lastCardData) return false

		const isSameColor = getCardColor(lastCardData.deck) === getCardColor(cardData.deck)

		if (isSameColor) return false
		if (lastCardData.number - 1 !== cardData.number) return false

		return true
	}

	return false
}

function createFoundation(deck: Deck, id?: string) {
	const foundation = document.createElement('div')
	const foundationIcon = document.createElement('div')
	const icon = createSVGIcon(deck)

	if (!id) id = getUIID()

	foundation.setAttribute('id', id)
	foundation.setAttribute('data-zone', 'foundation')
	foundation.classList.add('foundation', `${deck}-foundation`)
	foundationIcon.classList.add('foundation-icon')

	foundationIcon.appendChild(icon)
	foundation.appendChild(foundationIcon)

	const foundationData: States['gameboard']['foundations'][string] = {
		id,
		deck,
		cards: []
	}

	return { foundation, foundationData }
}

function flipCard({ card }: { card: HTMLDivElement }) {
	if (!card) return

	const cardData = STATES.gameboard.cards.find((c) => c.id === card.getAttribute('id'))
	if (!cardData) return
	cardData.flipped = true
	card.addEventListener('dblclick', handleDoubleClick)
}

function handleResetStack(event: MouseEvent | TouchEvent) {
	event.preventDefault()

	if (STATES.settings.difficulty === 'hard' && STATES.remainingStackTurns <= 0) return
	if (STATES.gameboard.stacked.cards.length > 0) return

	const showedCards = STATES.gameboard.showed.cards.toReversed()
	const stackedCards = STATES.gameboard.stacked.cards

	if (stackedCards.length > 0 || showedCards.length <= 0) return

	STATES.gameboard.showed.cards = []
	STATES.gameboard.stacked.cards = showedCards

	showedCards.forEach((card, index) => {
		const cardElement = document.getElementById(card.id) as HTMLDivElement

		if (!cardElement) return
		const cardData = getCardData({ card: cardElement })
		if (!cardData) return

		cardData.flipped = false
		cardData.showed = false
		cardData.stacked = true
		cardData.zone = 'stacked'

		const { x, y } = getStackCoors('stack', index)
		moveCard({ card: cardElement, x, y })

		updateCardElement({ card: cardElement, cardData })
	})

	if (STATES.settings.difficulty === 'hard' && STATES.remainingStackTurns >= 1)
		STATES.remainingStackTurns -= 1
	updateRemainingStackTurnsUI()
	$showCardFromStack.classList.remove('hidden')
}

function updateCardElement({ card, cardData }: { card: HTMLDivElement; cardData: Card }) {
	const cardId = card.getAttribute('id')
	const $frontFace = card.querySelector('.card-front-face')
	if (!cardId) return

	if (cardData.flipped) {
		// Obtener los indicators y agregarlos a la card
		if ($frontFace) $frontFace.innerHTML = ''

		for (const position of INDICATOR_POSITIONS) {
			const indicator = createCardIndicator(position, cardData.number, cardData.deck)

			if (!$frontFace) continue
			$frontFace.appendChild(indicator)
		}
	}

	card.setAttribute('data-flipped', String(cardData.flipped))
	card.setAttribute('data-zone', cardData.zone)
	card.setAttribute('data-zone-id', cardData.zoneId)
	card.setAttribute('data-zone', cardData.zone)

	if (cardData.stacked) {
		const zone = cardData.showed ? 'showed' : 'stacked'
		const cards = STATES.gameboard[zone].cards
		const cardIndex = cards.findIndex((c) => c.id === cardData.id) + 1

		card.style.setProperty('--index', String(cardIndex))
		return
	}

	let gamebordKey: GameboardKeys | null = null

	if (cardData.zone === 'foundation') gamebordKey = 'foundations'
	if (cardData.zone === 'zone') gamebordKey = 'zones'

	if (!gamebordKey) return

	const cards = STATES.gameboard[gamebordKey][cardData.zoneId]?.cards ?? []
	const cardIndex = cards.findIndex((c) => c.id === cardData.id) + 1
	card.style.setProperty('--index', String(cardIndex))
}

function showCardFromStack() {
	const stack = STATES.gameboard.stacked
	const card = stack.cards.at(-1)
	const { x, y } = getStackCoors('show')
	const cardData = getCardDataById({ id: card?.id ?? '' })
	const $card = document.getElementById(card?.id ?? '') as HTMLDivElement

	if (!cardData || !$card) return

	moveCard({ card: $card, x, y })
	cardData.flipped = true
	cardData.showed = true
	cardData.zone = 'showed'

	$card.style.setProperty('--index', String(STATES.gameboard.showed.cards.length))
	$card.classList.add('showing-card')

	flipCard({ card: $card })

	STATES.gameboard.stacked.cards.pop()
	STATES.gameboard.showed.cards.push({ id: cardData.id })

	updateCardElement({ card: $card, cardData })
	playSound({ id: 'show-card-from-stack' })

	addMovement({
		from: {
			id: 'card-stack',
			zone: 'stacked'
		},
		to: {
			id: 'card-stack',
			zone: 'showed'
		},
		cards: [{ id: cardData.id }]
	})
	setRedoMovements([])

	setTimeout(() => {
		$card.classList.remove('moving-card')
		$card.classList.remove('showing-card')
	}, MOVING_CARD_DURATION)
}

function getCardDataById({ id }: { id: string }) {
	const cardData = STATES.gameboard.cards.find((c) => c.id === id)
	if (!cardData) return

	return cardData
}

function getCardData({ card }: { card: HTMLDivElement }) {
	const cardData = STATES.gameboard.cards.find((c) => c.id === card.getAttribute('id'))
	if (!cardData) return

	return cardData
}

function createCardZone({ index, id }: { index: number; id?: string }) {
	if (!id) id = getUIID()

	const div = document.createElement('div')
	const emptyZoneDiv = document.createElement('div')
	const zoneIndex = index + 1

	div.classList.add('zone', 'empty-zone')
	div.setAttribute('id', id)
	div.setAttribute('data-zone', 'zone')
	div.setAttribute('data-zone-index', `zone-${zoneIndex}`)

	emptyZoneDiv.classList.add('empty-zone')
	emptyZoneDiv.innerText = 'Rey'

	div.appendChild(emptyZoneDiv)

	const zoneData: Zone = {
		zone: 'zone',
		id,
		cards: [],
		index: zoneIndex
	}

	return { cardZone: div, zoneData }
}

function getElementUnderCard({ card, x, y }: { card: HTMLDivElement; x: number; y: number }) {
	card.style.pointerEvents = 'none'
	const elementUnderCard = document.elementFromPoint(x, y)
	card.style.pointerEvents = 'auto'

	return elementUnderCard
}

function createFoundations() {
	if (!$cardsFoundations) return

	DECKS.forEach((deck) => {
		const { foundation, foundationData } = createFoundation(deck)

		STATES.gameboard.foundations[foundationData.id] = foundationData
		$cardsFoundations.appendChild(foundation)
	})
}

function getCardColor(deck: Deck): CardColor {
	if (['diamonds', 'hearts'].includes(deck)) return 'red'
	if (['clubs', 'spades'].includes(deck)) return 'black'
	return 'black'
}

function restoreCardPosition({
	card,
	zone,
	zoneId
}: {
	card: HTMLDivElement
	zone: string
	zoneId: string
}) {
	card.classList.add('moving-card')

	setTimeout(() => {
		card.classList.remove('moving-card')
	}, MOVING_CARD_DURATION)

	if (zone === 'showed') {
		const { x, y } = getStackCoors('show')
		moveCard({ card, x, y })
		return
	}

	const { x, y } = getZoneCoords(zoneId)
	moveCard({ card, x, y })

	updateZoneSize({ zoneId })

	const cardData = getCardData({ card })
	if (cardData) updateCardElement({ card, cardData })

	return
}

async function setupGame() {
	setGameProperties()

	if ($cardsStack) {
		const resetStack = createResetStackElement()
		const { x, y } = getStackCoors('stack')

		resetStack.style.setProperty('--x', `${x}px`)
		resetStack.style.setProperty('--y', `${y}px`)
		$cardsStack.appendChild(resetStack)
	}

	createFoundations()

	for (let i = 0; i < CARD_ZONES; i++) {
		const { cardZone, zoneData } = createCardZone({ index: i })
		$zones.appendChild(cardZone)
		STATES.gameboard.zones[zoneData.id] = zoneData
	}

	await createAllCards()

	STATES.playing = true
	STATES.isFirstMoveMade = false
	STATES.gameboard.movements = []
	STATES.gameboard.redoMovements = []
	STATES.omitAnimation = false
	STATES.initialGameboard = structuredClone(STATES.gameboard)

	setTimeout(() => {
		showActionsContainer()
		if (STATES.settings.difficulty === 'hard') $remainingStackTurns.classList.remove('hidden')

		console.log({ g: STATES.gameboard })
	}, 250)
}

function getZoneCoords(zoneId: string) {
	const zone = document.getElementById(zoneId)
	const zoneData = STATES.gameboard.zones[zoneId]
	const isZone = zoneData && 'zone' in zoneData && zoneData.zone === 'zone'

	if (!zone) return { x: 0, y: 0 }

	const rect = zone.getBoundingClientRect()

	const x = rect.left + window.scrollX + (rect.width - CARD_STATE.width) / 2
	let y = rect.top + window.scrollY

	if (isZone) y += CARD_STATE.zonePaddingY / 2

	if (!isZone) y += (rect.height - CARD_STATE.height) / 2

	return {
		x,
		y
	}
}

async function createAllCards() {
	const { x: xStandBy, y: yStandBy } = getZoneCoords('cards-stand-by')

	for (const deck of DECKS) {
		for (let i = 1; i <= LAST_CARD_NUMBER; i++) {
			const { card, cardData } = createCard({ deck: deck, number: i })

			STATES.gameboard.cards.push(cardData)
			card.classList.add('card-setting-up')

			$cardsContainer?.appendChild(card)
			moveCard({ card, x: xStandBy, y: yStandBy })
		}
	}

	const cards = STATES.gameboard.cards

	swapCards({ cards })
	swapCards({ cards: STATES.gameboard.cards })

	const cantCardsInZone = Array.from({ length: CARD_ZONES }, (_, i) => i + 1).reduce(
		(acc, curr) => acc + curr,
		0
	)

	await Promise.all([
		moveCardsToZone({ cards: cards.slice(0, cantCardsInZone) }),
		moveCardstoStack({ cards: cards.slice(cantCardsInZone, cards.length) })
	])
}

async function moveCardstoStack({ cards }: { cards: Card[] }) {
	const time = 100

	for (let index = 0; index < cards.length; index++) {
		const card = cards[index]
		const $card = document.getElementById(card?.id ?? '') as HTMLDivElement
		const indexCard = STATES.gameboard.stacked.cards.length

		if (!card || !$card) continue

		card.zoneId = 'cards-stack'
		card.zone = 'stacked'
		card.stacked = true
		card.showed = false

		STATES.gameboard.stacked.cards.push({ id: card.id })

		updateCardElement({ card: $card, cardData: card })
		$card.style.setProperty('--index', String(indexCard))

		await new Promise((resolve) => setTimeout(resolve, time))

		$card.classList.remove('card-setting-up')
		// $card.addEventListener('click', handleClick)
		// $card.addEventListener('touchend', handleClick)

		const { x, y } = getStackCoors('stack', indexCard)
		moveCard({ card: $card, x, y })
		playSound({ id: 'show-card' })
	}
}

function swapCards({ cards }: { cards: Card[] }) {
	for (let i = cards.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1))

		const cardI = cards[i]
		const cardJ = cards[j]

		if (cardI !== undefined && cardJ !== undefined) {
			;[cards[i], cards[j]] = [cardJ, cardI]
		}
	}
}

function moveCardToZone({ card, zoneData }: { card: Card; zoneData: Zone }) {
	const cardData = getCardDataById({ id: card.id })
	const $card = document.getElementById(card.id) as HTMLDivElement

	if (!cardData || !$card) return

	const cardZone = cardData.zone

	if (cardData.stacked && cardData.showed) {
		// $card.removeEventListener('click', handleClick)
		STATES.gameboard.showed.cards.pop()
	}

	if (cardZone === 'zone') {
		const cards = zoneData.cards
		const cardIndex = cards.findIndex((c) => c.id === cardData.id)

		if (cardIndex !== -1) zoneData.cards = cards.slice(0, cardIndex)
		flipLastCard({ zoneData })
	}

	$card.style.setProperty('--index', String(zoneData.cards.length))

	zoneData.cards.push({
		id: card.id
	})

	cardData.stacked = false
	cardData.showed = false
	cardData.zone = 'zone'
	cardData.zoneId = zoneData.id

	setTimeout(() => {
		$card.classList.remove('card-setting-up')
	}, MOVING_CARD_DURATION / 4)

	const { x, y } = getZoneCoords(zoneData.id)

	updateCardElement({ card: $card, cardData })

	moveCard({ card: $card, x, y })
}

async function moveCardsToZone({ cards }: { cards: Card[] }) {
	let cardIndex = 0
	const cardsToFlip: { card: HTMLDivElement; cardData: Card }[] = []

	for (let zoneIndex = 1; zoneIndex <= CARD_ZONES; zoneIndex++) {
		for (let k = 0; k < zoneIndex; k++) {
			const card = cards[cardIndex]
			const zone = `zone-${zoneIndex}`
			const $zone = document.querySelector(`[data-zone-index="${zone}"]`)
			const $card = document.getElementById(card?.id ?? '') as HTMLDivElement

			if (!$card || !$zone || !card) continue

			const zoneId = $zone.getAttribute('id') ?? ''
			const zoneData = STATES.gameboard.zones[zoneId]
			const cardData = getCardDataById({ id: card.id })

			if (!zoneData || !cardData) continue

			await new Promise((resolve) => setTimeout(resolve, 100))
			moveCardToZone({ card, zoneData })

			if (k === zoneIndex - 1) cardsToFlip.push({ card: $card, cardData })

			updateZoneSize({ zoneId })
			playSound({ id: 'show-card' })
			cardIndex++
		}
	}

	for (const card of cardsToFlip) {
		flipCard({ card: card.card })
		updateCardElement({ card: card.card, cardData: card.cardData })

		await new Promise((resolve) => setTimeout(resolve, 50))
	}
}

function updateZoneSize({ zoneId, cards }: { zoneId: string; cards?: CardId[] }) {
	const $zone = document.getElementById(zoneId)
	const zoneData = STATES.gameboard.zones[zoneId]

	if (!$zone || !zoneData) return
	if (!cards) cards = zoneData.cards

	const height =
		CARD_STATE.height + CARD_STATE.indicatorHeight * (cards.length - 1) + CARD_STATE.zonePaddingY
	$zone.style.height = `${height}px`

	if (cards.length === 0) $zone.classList.add('empty-zone')
	else $zone.classList.remove('empty-zone')
}

function moveCardsToFoundation({ cards }: { cards: Card[] }) {
	for (const card of cards) {
		const $card = document.getElementById(card.id) as HTMLDivElement
		const zoneId = card.zoneId
		const zoneData = STATES.gameboard.foundations[zoneId]
		const cardData = getCardDataById({ id: card.id })

		if (!$card || !zoneData || !cardData) continue

		const { x, y } = getZoneCoords(zoneId)

		cardData.zone = 'foundation'
		cardData.zoneId = zoneId
		cardData.stacked = false
		cardData.showed = false
		cardData.flipped = true

		moveCard({ card: $card, x, y })
		playSound({ id: 'show-card' })
	}
}

async function setupGame2() {
	setGameProperties()

	STATES.playing = true

	if ($cardsStack) {
		const resetStack = createResetStackElement()
		const { x, y } = getStackCoors('stack')

		resetStack.style.setProperty('--x', `${x}px`)
		resetStack.style.setProperty('--y', `${y}px`)
		$cardsStack.appendChild(resetStack)
	}

	const { x: xStandBy, y: yStandBy } = getZoneCoords('cards-stand-by')
	STATES.gameboard = newGameboard

	for (const [_, oldFoundationData] of Object.entries(STATES.gameboard.foundations)) {
		const { foundation } = createFoundation(oldFoundationData.deck, oldFoundationData.id)

		$cardsFoundations.appendChild(foundation)
	}

	for (const oldCardData of STATES.gameboard.cards) {
		const { card, cardData } = createCard(oldCardData)
		$cardsContainer?.appendChild(card)
		oldCardData.id = cardData.id
		moveCard({ card, x: xStandBy, y: yStandBy })
	}

	let zoneIndex = 0

	for (const oldZoneData of Object.values(STATES.gameboard.zones)) {
		const { cardZone } = createCardZone({ index: zoneIndex, id: oldZoneData.id })
		$zones.appendChild(cardZone)
		zoneIndex++
	}

	await syncUIWithData({ gameboard: STATES.gameboard })

	updateMovementsCounterUI()
	updateRedoUndoButton()
}

async function resetGame({ gameboard }: { gameboard: Gameboard }) {
	const { stacked } = gameboard

	const zonesEntries = Object.entries(gameboard.zones) as [string, Zone][]

	STATES.gameboard.cards = gameboard.cards

	async function moveToZones() {
		for (const [_, zone] of zonesEntries) {
			const newZoneData = STATES.gameboard.zones[zone.id]

			if (newZoneData) newZoneData.cards = []

			for (const card of zone.cards) {
				const cardData = getCardDataById({ id: card.id })
				const $card = document.getElementById(card.id) as HTMLDivElement

				if (!cardData || !$card) continue

				const { x, y } = getZoneCoords(zone.id)
				moveCard({ card: $card, x, y })
				playSound({ id: 'show-card' })

				cardData.zone = 'zone'
				cardData.zoneId = zone.id
				cardData.stacked = false
				cardData.showed = false
				// cardData.flipped = false

				if (newZoneData) newZoneData.cards.push({ id: cardData.id })

				updateZoneSize({ zoneId: zone.id })
				updateCardElement({ card: $card, cardData })

				setTimeout(() => {
					$card.classList.remove('card-setting-up')
				}, MOVING_CARD_DURATION / 4)
				await new Promise((resolve) => setTimeout(resolve, 100))
			}
		}
	}

	async function moveToStack() {
		const newStacked = STATES.gameboard.stacked

		newStacked.cards = []

		const cardsDataStacked = stacked.cards
			.map(({ id }) => getCardDataById({ id }))
			.filter((card) => card !== undefined)
		moveCardstoStack({ cards: cardsDataStacked })
	}

	await Promise.all([moveToZones(), moveToStack()])
}

function playSound({
	id,
	vol = 0.1,
	loop = false,
	reset = true
}: {
	id: SoundId
	vol?: number
	loop?: boolean
	reset?: boolean
}) {
	const sound = SOUNDS[id]

	if (reset) sound.currentTime = 0
	sound.volume = vol
	sound.loop = loop
	// sound.play()
}

function stopSound({ id, reset = false }: { id: SoundId; reset?: boolean }) {
	const sound = SOUNDS[id]
	sound.pause()
	if (reset) sound.currentTime = 0
}

function flipLastCard({ zoneData }: { zoneData: Zone }) {
	const lastCard = zoneData.cards.at(-1)
	const $lastCard = document.getElementById(lastCard?.id ?? '') as HTMLDivElement
	const lastCardData = getCardDataById({ id: lastCard?.id ?? '' })
	if ($lastCard && lastCardData) {
		flipCard({ card: $lastCard })
		updateCardElement({ card: $lastCard, cardData: lastCardData })
	}
}

// Revisar si el usario ganó
function getIsGameWon() {
	const { showed, stacked, cards } = STATES.gameboard

	if (stacked.cards.length > 0) return false
	if (showed.cards.length > 1) return false

	return cards.every((c) => c.flipped)
}

function handleWindowResize() {
	updateCardSizeWithMediaQuery()
	const cards = STATES.gameboard.cards

	for (const card of cards) {
		const $card = document.getElementById(card.id) as HTMLDivElement

		if (card.stacked) {
			let { x, y } = getStackCoors('show')

			if (!card.showed) {
				const cardIndex = STATES.gameboard.stacked.cards.findIndex((c) => c.id === card.id)
				;({ x, y } = getStackCoors('stack', cardIndex))
			}

			moveCard({ card: $card, x, y })
			continue
		}

		const { x, y } = getZoneCoords(card.zoneId)
		moveCard({ card: $card, x, y })
	}
}

function getMatchMediaQuery() {
	const lgQuery = window.matchMedia('(width >= 64rem)')
	const mdQuery = window.matchMedia('(width >= 48rem )')
	const smQuery = window.matchMedia('(width >= 40rem)')
	const xsQuery = window.matchMedia('(width < 40rem)')

	return {
		lgQuery,
		mdQuery,
		smQuery,
		xsQuery
	}
}

function updateCardSizeWithMediaQuery() {
	const { lgQuery, mdQuery, smQuery, xsQuery } = getMatchMediaQuery()

	if (smQuery.matches || xsQuery.matches) {
		CARD_STATE.width = CARD_WIDTH * 0.45
		CARD_STATE.height = CARD_HEIGHT * 0.45
		CARD_STATE.indicatorHeight = CARD_INDICATOR_HEIGHT * 0.45
		CARD_STATE.indicatorEdgeSvgSize = INDICATOR_EDGE_SVG_SIZE * 0.45
		CARD_STATE.indicatorMiddleSvgSize = INDICATOR_MIDDLE_SVG_SIZE * 0.35
		CARD_STATE.zoneWidth = ZONE_WIDTH * 0.45
		CARD_STATE.zoneHeight = ZONE_HEIGHT * 0.45
		CARD_STATE.foundationWidth = FOUNDATION_WIDTH * 0.45
		CARD_STATE.foundationHeight = FOUNDATION_HEIGHT * 0.45
	}

	if (mdQuery.matches) {
		CARD_STATE.width = CARD_WIDTH * 0.8
		CARD_STATE.height = CARD_HEIGHT * 0.8
		CARD_STATE.indicatorHeight = CARD_INDICATOR_HEIGHT * 0.8
		CARD_STATE.indicatorEdgeSvgSize = INDICATOR_EDGE_SVG_SIZE * 0.8
		CARD_STATE.indicatorMiddleSvgSize = INDICATOR_MIDDLE_SVG_SIZE * 0.8
		CARD_STATE.zoneWidth = ZONE_WIDTH * 0.8
		CARD_STATE.zoneHeight = ZONE_HEIGHT * 0.8
		CARD_STATE.foundationWidth = FOUNDATION_WIDTH * 0.8
		CARD_STATE.foundationHeight = FOUNDATION_HEIGHT * 0.8
	}

	if (lgQuery.matches) {
		CARD_STATE.width = CARD_WIDTH
		CARD_STATE.height = CARD_HEIGHT
		CARD_STATE.indicatorHeight = CARD_INDICATOR_HEIGHT
		CARD_STATE.indicatorEdgeSvgSize = INDICATOR_EDGE_SVG_SIZE
		CARD_STATE.indicatorMiddleSvgSize = INDICATOR_MIDDLE_SVG_SIZE
		CARD_STATE.zoneWidth = ZONE_WIDTH
		CARD_STATE.zoneHeight = ZONE_HEIGHT
		CARD_STATE.foundationWidth = FOUNDATION_WIDTH
		CARD_STATE.foundationHeight = FOUNDATION_HEIGHT
	}

	CARD_STATE.zonePaddingY = CARD_STATE.zoneHeight - CARD_STATE.height
}

function setGameProperties() {
	updateCardSizeWithMediaQuery()

	document.documentElement.style.setProperty('--card-width', `${CARD_STATE.width}px`)
	document.documentElement.style.setProperty('--card-height', `${CARD_STATE.height}px`)
	document.documentElement.style.setProperty(
		'--card-indicator-height',
		`${CARD_STATE.indicatorHeight}px`
	)
	document.documentElement.style.setProperty('--moving-card-duration', `${MOVING_CARD_DURATION}ms`)
	document.documentElement.style.setProperty(
		'--indicator-edge-svg-size',
		`${CARD_STATE.indicatorEdgeSvgSize}px`
	)
	document.documentElement.style.setProperty(
		'--indicator-middle-svg-size',
		`${CARD_STATE.indicatorMiddleSvgSize}px`
	)
	document.documentElement.style.setProperty(`--zone-width`, `${CARD_STATE.zoneWidth}px`)
	document.documentElement.style.setProperty(`--zone-height`, `${CARD_STATE.zoneHeight}px`)
	document.documentElement.style.setProperty(
		`--foundation-width`,
		`${CARD_STATE.foundationWidth}px`
	)
	document.documentElement.style.setProperty(
		`--foundation-height`,
		`${CARD_STATE.foundationHeight}px`
	)
	document.documentElement.style.setProperty(
		'--ending-animated-card-duration',
		`${ENDING_ANIMATED_CARD_DURATION}ms`
	)
}

async function handleGameWon() {
	let isGameCompleted = false
	const foundationsEntries = Object.entries(STATES.gameboard.foundations)
	const globalCards = STATES.gameboard.cards
	let isEndingGame = true

	document.body.style.overflow = 'hidden'
	STATES.playing = false

	await new Promise((resolve) => setTimeout(resolve, 200))

	while (!isGameCompleted) {
		for (const [_, f] of foundationsEntries) {
			const card = f.cards.at(-1)
			const $card = document.getElementById(card?.id ?? '') as HTMLDivElement

			if (!card || !$card) continue

			// Buscar la carta en cards
			const cardData = globalCards.find((c) => c.id === card.id)

			if (!cardData) continue

			// Buscar la carta que va sobre la carta actual
			const nextCardData = globalCards.find(
				(c) => c.deck === cardData.deck && c.number === cardData.number + 1
			)
			const $nextCard = document.getElementById(nextCardData?.id ?? '') as HTMLDivElement

			if (!nextCardData || !$nextCard) continue

			// De acuerdo a la nueva carta de la carta buscar la zoneId
			const zoneId = nextCardData.zoneId
			// Obtener la zoneData de acuerdo al zoneId

			const zoneData = STATES.gameboard.zones[zoneId]
			if (!zoneData) continue

			// Obtener la última carta de la zone
			const lastCard = zoneData.cards.at(-1)

			if (!lastCard) continue

			// Verificar que la nueva carta y la última carta sean iguales

			if (nextCardData.id !== lastCard.id) continue

			// -> Mover la carta en ui y en el gameboard

			nextCardData.zone = 'foundation'
			nextCardData.zoneId = f.id

			zoneData.cards.pop()

			f.cards.push({ id: nextCardData.id })

			const { x, y } = getZoneCoords(f.id)

			moveCard({ card: $nextCard, x, y })
			updateCardElement({ card: $nextCard, cardData: nextCardData })
			updateZoneSize({ zoneId })
			playSound({ id: 'card-placement' })
			addMovement({
				from: {
					id: cardData.zoneId,
					zone: cardData.zone
				},
				to: {
					id: f.id,
					zone: 'foundation'
				},
				cards: [nextCardData]
			})
			setRedoMovements([])

			updateMovementsCounterUI()

			await new Promise((resolve) => setTimeout(resolve, 100))
		}

		// await new Promise(resolve => setTimeout(resolve, 1000))
		const areAllCardsInFoundation = foundationsEntries.every(([_, f]) => f.cards.length === 13)

		isGameCompleted = areAllCardsInFoundation
	}

	if (STATES.time.interval) clearInterval(STATES.time.interval)

	await new Promise((resolve) => setTimeout(resolve, 500))

	hideInfoUI()

	$omitButton.classList.remove('hidden')

	while (isEndingGame) {
		for (const [_, f] of foundationsEntries) {
			const lastCard = f.cards.pop()
			const { x, y } = getRandomCenteredPosition(0.2)

			if (!lastCard) continue

			const cardData = globalCards.find((c) => c.id === lastCard.id)
			const $card = document.getElementById(lastCard.id) as HTMLDivElement

			if (!cardData || !$card) continue

			moveCard({ card: $card, x, y })

			setTimeout(() => {
				$cardsContainer.removeChild($card)
			}, MOVING_CARD_DURATION + 100)

			setTimeout(() => {
				// const { x, y } = $card.getBoundingClientRect()
				const animatedCard = createEndingAnimatedCard({
					deck: cardData.deck,
					number: cardData.number,
					x,
					y
				})

				document.body.appendChild(animatedCard)
				animatedCard.classList.add('animate')
				playSound({ id: 'paper-rip', vol: 0.2 })

				setTimeout(() => {
					document.body.removeChild(animatedCard)
				}, ENDING_ANIMATED_CARD_DURATION)
			}, MOVING_CARD_DURATION)

			await new Promise((resolve) => setTimeout(resolve, 200))
		}

		if (STATES.omitAnimation) {
			await handleOmitEndAnimation()
			break
		}

		isEndingGame = !foundationsEntries.every(([_, f]) => f.cards.length === 0)
	}

	stopSound({ id: 'music', reset: true })

	setTimeout(() => {
		hideInfoUI()
		updateWinModalUI()
		openModal({ id: 'end-game-dialog' })

		playSound({ id: 'victory', vol: 0.05 })

		setTimeout(() => {
			playSound({ id: 'music', vol: 0.05, loop: true, reset: false })
		}, SOUNDS.victory.duration * 1000)
	}, 200)
}

function createEndingAnimatedCard({
	deck,
	number,
	x,
	y
}: {
	deck: Deck
	number: number
	x: number
	y: number
}) {
	const cardParts = ['top-left', 'top-right', 'bottom-left', 'bottom-right']
	const cardColor = getCardColor(deck)

	const dividedCard = document.createElement('div')

	dividedCard.classList.add('divided-card', cardColor)
	dividedCard.style.left = `${x}px`
	dividedCard.style.top = `${y}px`

	for (const p of cardParts) {
		const partElement = document.createElement('div')
		partElement.classList.add('card-part', `card-part-${p}`)
		const mainIcon = createSVGIcon(deck)

		mainIcon.classList.add('main-icon')

		if (p === 'top-left' || p === 'bottom-right') {
			const indicator = document.createElement('div')
			const span = document.createElement('span')
			const icon = createSVGIcon(deck)

			indicator.classList.add('card-indicator')
			span.textContent = `${FIGURES[number] ?? number}`
			indicator.appendChild(span)
			indicator.appendChild(icon)

			if (p === 'bottom-right') partElement.appendChild(mainIcon)

			partElement.appendChild(indicator)
		}

		if (p !== 'bottom-right') partElement.appendChild(mainIcon)

		dividedCard.appendChild(partElement)
	}

	return dividedCard
}

function getRandomCenteredPosition(percentage = 0.7) {
	const width = window.innerWidth
	const height = window.innerHeight

	const usableWidth = width * percentage
	const usableHeight = height * percentage

	const xOffset = (width - usableWidth) / 2
	const yOffset = (height - usableHeight) / 2

	const randomX = xOffset + Math.random() * usableWidth
	const randomY = yOffset + Math.random() * usableHeight

	return { x: randomX, y: randomY }
}

function updateTimer() {
	const timerContainer = $('#time-container') as HTMLDivElement
	const secondsElement = timerContainer?.querySelector('.time-card-seconds') as HTMLDivElement
	const minutesElement = timerContainer?.querySelector('.time-card-minutes') as HTMLDivElement
	const hoursElement = timerContainer?.querySelector('.time-card-hours') as HTMLDivElement

	if (!timerContainer || !secondsElement || !minutesElement || !hoursElement) return

	const { minutes, hours } = getFormattedTime()
	const {
		hours: hoursString,
		minutes: minutesString,
		seconds: secondsString
	} = formattedTimeToFormattedString()

	secondsElement.textContent = secondsString
	minutesElement.textContent = minutesString
	hoursElement.textContent = hoursString

	setTimeout(() => {
		timerContainer.classList.remove('hidden')
	}, 200)

	const showMinutesElement = minutes > 0 && STATES.time.time <= 60
	const showHoursElement = hours > 0 && STATES.time.time <= 3600

	if (showMinutesElement || showHoursElement) {
		const colonElement = minutesElement.nextElementSibling as HTMLDivElement

		if (!colonElement) return

		minutesElement.classList.remove('hidden')
		colonElement.classList.remove('hidden')
	}

	if (showHoursElement) {
		const colonElement = hoursElement.nextElementSibling as HTMLDivElement

		if (!colonElement) return

		hoursElement.classList.remove('hidden')
		colonElement.classList.remove('hidden')
	}
}

function getFormattedTime() {
	const currentTime = STATES.time.time

	const hours = Math.floor(currentTime / 3600)
	const minutes = Math.floor((currentTime % 3600) / 60)
	const seconds = Math.floor(currentTime % 60)

	return {
		hours,
		minutes,
		seconds
	}
}

function handleRedoUndoMove(movementType: 'redo' | 'undo' = 'undo') {
	const isHardDifficulty = STATES.settings.difficulty === 'hard'
	if (isHardDifficulty) return

	// debugger;

	const movementKey = movementType === 'undo' ? 'movements' : 'redoMovements'
	const movement = STATES.gameboard[movementKey].pop()

	if (!movement) return

	let { from: to, to: from, cards } = movement

	if (movementType === 'redo') {
		;({ from, to } = movement)
	}

	const gameboard = STATES.gameboard

	if (from.zone === 'stacked') gameboard.stacked.cards.pop()
	if (from.zone === 'showed') gameboard.showed.cards.pop()
	if (from.zone === 'foundation') gameboard.foundations[from.id]?.cards.pop()
	if (from.zone === 'zone') {
		const zone = gameboard.zones[from.id]
		const zoneCards = zone?.cards ?? []
		const firstCardIndex = zoneCards.findIndex((c) => c.id === cards[0]?.id)

		if (zone) {
			zone.cards = zoneCards.slice(0, firstCardIndex)
		}
	}

	if (to.zone === 'stacked') gameboard.stacked.cards.push(...cards)
	if (to.zone === 'showed') gameboard.showed.cards.push(...cards)
	if (to.zone === 'foundation') gameboard.foundations[to.id]?.cards.push(...cards)
	if (to.zone === 'zone') {
		const zone = gameboard.zones[to.id]

		if (zone) {
			const lastCard = zone.cards.at(-1)
			const lastCardData = getCardDataById({ id: lastCard?.id ?? '' })
			const $lastCard = document.getElementById(lastCard?.id ?? '') as HTMLDivElement

			if (lastCardData && $lastCard && $lastCard) {
				if ('flippedLastCard' in movement && movement.flippedLastCard !== undefined) {
					lastCardData.flipped = movement.flippedLastCard
				}
				updateCardElement({ card: $lastCard, cardData: lastCardData })
			}

			zone.cards.push(...cards)
		}
	}

	const fromLastCard = from.zone === 'zone' ? STATES.gameboard.zones[from.id]?.cards.at(-1) : null
	const fromLastCardData = fromLastCard ? getCardDataById({ id: fromLastCard.id }) : null
	const isLastCardFlippled = fromLastCardData?.flipped ?? false
	const newMovement = { ...movement, flippedLastCard: isLastCardFlippled }

	const z = gameboard.zones[from.id]

	if (z) flipLastCard({ zoneData: z })

	if (movementType === 'undo') addMovement(newMovement, 'redo')
	if (movementType === 'redo') addMovement(newMovement, 'undo')

	for (const card of cards) {
		const cardData = getCardDataById({ id: card.id })
		const cardElement = document.getElementById(card.id) as HTMLDivElement
		if (!cardElement || !cardData) continue

		if (to.zone === 'stacked' || to.zone === 'showed') {
			const side = to.zone === 'stacked' ? 'stack' : 'show'
			const isStacked = to.zone === 'stacked'
			const isShowed = to.zone === 'showed'

			const { x, y } = getStackCoors(side, gameboard.stacked.cards.length)
			moveCard({ card: cardElement, x, y })

			cardData.stacked = isStacked || isShowed
			cardData.showed = isShowed
			cardData.flipped = isShowed
		}

		if (['foundation', 'zone'].includes(to.zone)) {
			const { x, y } = getZoneCoords(to.id)
			moveCard({ card: cardElement, x, y })
		}

		updateZoneSize({ zoneId: from.id })
		updateZoneSize({ zoneId: to.id })

		cardData.zoneId = to.id
		cardData.zone = to.zone

		updateCardElement({ card: cardElement, cardData })
	}

	updateMovementsCounterUI()
}


function updateRedoUndoButton() {
	const redoDisabled = STATES.gameboard.redoMovements.length === 0
	const undoDisabled = STATES.gameboard.movements.length === 0
	const isHardDifficulty = STATES.settings.difficulty === 'hard'

	$redoButton.disabled = redoDisabled || isHardDifficulty
	$undoButton.disabled = undoDisabled || isHardDifficulty
}

function addGlobalEventListeners() {
	document.addEventListener('mousemove', handleMouseMove)
	document.addEventListener('touchmove', handleMouseMove)
	document.addEventListener('mouseleave', handleMouseLeave)
	document.addEventListener('touchleave', handleMouseLeave)
	window.addEventListener('resize', handleWindowResize)
	$redoButton.addEventListener('click', () => handleRedoUndoMove('redo'))
	$undoButton.addEventListener('click', () => handleRedoUndoMove('undo'))

	// Asignar evento de click para cada boton para cerrar un modal
	$closeModalButtons.forEach(($closeModalButton) => {
		$closeModalButton.addEventListener('click', () => {
			const modalId = $closeModalButton.dataset.modalId ?? ''
			closeModal({ id: modalId })

      STATES.playing = true
			continueTimer()

			showActionsContainer()
		})
	})
  

	// Anadir evento al botón new-game en el menú de opciones
	$newGameButton.addEventListener('click', () => {
		const $dialogMainOptions = $('#main-options-dialog') as HTMLDivElement
		if ($dialogMainOptions) $dialogMainOptions.dataset.status = 'new-game'
		openModal({ id: 'main-options-dialog' })
		provitionalSettings = structuredClone(STATES.settings)

		updateDifficultyUI()
		updateTogglerUI()
	})

	// Anadir evento al botón play
	$playButton.addEventListener('click', () => {
		STATES.settings = structuredClone(provitionalSettings)

		const isHardDifficulty = STATES.settings.difficulty === 'hard'

		handleResetGame()
		setGameSketch()

		updateDifficultyUI()
		updateTogglerUI()

		const classListFunctionKey = isHardDifficulty ? 'add' : 'remove'

		$redoButton.classList[classListFunctionKey]('hidden')
		$undoButton.classList[classListFunctionKey]('hidden')

		setTimeout(() => {
			removeGameSketch()
			setupGame()
		}, MOVING_CARD_DURATION + 500)
	})

	// Añadir eventos de change para los togglers
	$inputTimer.addEventListener('change', () => {
		const isTimerActive = $inputTimer.checked
		provitionalSettings.isTimerActive = isTimerActive
		updateTogglerUI()
	})

	$inputMovementsCounter.addEventListener('change', () => {
		const isMovementsCounterActive = $inputMovementsCounter.checked
		provitionalSettings.isMovementsCounterActive = isMovementsCounterActive
		updateTogglerUI()
	})

	// Anadir evento a los botones de dificultad
	$difficulties.forEach(($difficulty) => {
		$difficulty.addEventListener('click', handleChangeDifficulty)
		$difficulty.addEventListener('touchend', handleChangeDifficulty)
	})

	// Evitar evento por defecto de escape en los modales
	$dialogs.forEach((d) => {
		d.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') event.preventDefault()
		})
	})

	// Añadir evento al botón pause
	$pauseButton.addEventListener('click', pauseGame)

	// Agregar eventos al botones del modal de pausa
	$continuePlayingButton.addEventListener('click', unPauseGame)
	$restartPlayingButton.addEventListener('click', handleRestarGame)

	// Agregar evento al botón play again
	$playAgainButton.addEventListener('click', () => {
		closeModal({ id: 'end-game-dialog' })
		setTimeout(() => openModal({ id: 'main-options-dialog' }), 200)
	})

	// Añadir evento al documento para reproducir el sonido
	document.addEventListener('click', handleDocumentClick)

	// Añadir eventos para pausar/mutear el sonido cuando se pierde el foco
	window.addEventListener('blur', () => {
		stopSound({ id: 'music' })
		muteAllSounds()

    pauseTimer()
	})

	// Añadir eventos para reanudar el sonido cuando se gana el foco
	window.addEventListener('focus', () => {
		playSound({ id: 'music', vol: 0.05, loop: true, reset: false })
		unmuteAllSounds()

    continueTimer()
	})

	$omitButton.addEventListener('click', () => {
		STATES.omitAnimation = true
		$omitButton.classList.add('hidden')
	})

	$showCardFromStack.addEventListener('click', () => {
		showCardFromStack()
		if (STATES.gameboard.stacked.cards.length === 0) $showCardFromStack.classList.add('hidden')
	})
}

function startTimer() {
	if (STATES.time.interval && !STATES.settings.isTimerActive) return

	$counterContainer.classList.remove('hidden')

	updateTimer()

	STATES.time.interval = setInterval(() => {
		STATES.time.time++
		updateTimer()
	}, 1000)
}

function pauseTimer() {
	if (!STATES.time.interval) return
	clearInterval(STATES.time.interval)
	STATES.time.interval = null
}

function continueTimer() {
  if (STATES.time.time > 0)startTimer()
}

function resetTimer() {
	pauseTimer()
	STATES.time.time = 0
}

function setGameSketch() {
	setGameProperties()

	if ($cardsStack) {
		const resetStack = createResetStackElement()
		const { x, y } = getStackCoors('stack')

		resetStack.style.setProperty('--x', `${x}px`)
		resetStack.style.setProperty('--y', `${y}px`)
		$cardsStack.appendChild(resetStack)
	}

	createFoundations()

	for (let i = 0; i < CARD_ZONES; i++) {
		const { cardZone, zoneData } = createCardZone({ index: i })

		$zones.appendChild(cardZone)
		STATES.gameboard.zones[zoneData.id] = zoneData
	}
}

function removeGameSketch() {
	if ($cardsStack) $cardsStack.innerHTML = ''
	const gameboard = STATES.gameboard

	const $foundations = document.querySelectorAll('[data-zone="foundation"]')
	$foundations.forEach(($foundation) => $foundation.remove())

	const $zones = document.querySelectorAll('[data-zone="zone"]')
	$zones.forEach(($zone) => $zone.remove())

	gameboard.foundations = {}
	gameboard.zones = {}
}

function showActionsContainer() {
	updateRedoUndoButton()
	$actionsContainer.classList.remove('hidden')
}

function hideActionsContainer() {
	$actionsContainer.classList.add('hidden')
}

function updateDifficultyUI() {
	const difficulty = provitionalSettings.difficulty

	document
		.querySelectorAll('.difficulty-card')
		.forEach((card) => card.classList.remove('difficulty-selected'))
	document.getElementById(`difficulty-${difficulty}`)?.classList.add('difficulty-selected')

	$difficultyBadgeIndicator.dataset.difficulty = STATES.settings.difficulty
	$difficultyDescriptionsContainer.dataset.difficulty = difficulty
}

function changeDifficulty(difficulty: Difficulties) {
	provitionalSettings.difficulty = difficulty
	updateDifficultyUI()

	console.log({ provitionalSettings, states: STATES.settings })
}

function updateTogglerUI() {
	const isTimerActive = provitionalSettings.isTimerActive
	const isMovementsCounterActive = provitionalSettings.isMovementsCounterActive

	$toggleTimerContainer.dataset.active = isTimerActive.toString()
	$toggleMovementsCounterContainer.dataset.active = isMovementsCounterActive.toString()

	$inputTimer.checked = isTimerActive
	$inputMovementsCounter.checked = isMovementsCounterActive
}

function openModal({ id }: { id: string }) {
	const $modal = document.getElementById(id) as HTMLDialogElement
	$modal?.showModal()

	hideActionsContainer()
	pauseTimer()
}

function closeModal({ id }: { id: string }) {
	const $modal = document.getElementById(id) as HTMLDialogElement
	$modal?.close()
}

function handleResetGame() {
	const gameboard = STATES.gameboard
	const cards = gameboard.cards
	closeModal({ id: 'main-options-dialog' })

	$counterContainer.classList.add('hidden')
	$timeContainer.classList.add('hidden')
	$movementsContainer.classList.add('hidden')
	$remainingStackTurns.classList.add('hidden')

	resetTimer()

	if (cards.length === 52) {
		for (const card of cards) {
			const { x: xStandBy, y: yStandBy } = getZoneCoords('cards-stand-by')
			const cardElement = document.getElementById(card.id) as HTMLDivElement

			if (!cardElement) continue

			cardElement.classList.add('card-setting-up')
			moveCard({ card: cardElement, x: xStandBy, y: yStandBy })

			setTimeout(() => cardElement.remove(), MOVING_CARD_DURATION)
		}
	}

	gameboard.cards = []
	gameboard.stacked.cards = []
	gameboard.showed.cards = []
	gameboard.foundations = {}
	gameboard.zones = {}

	$zones.innerHTML = ''
	$cardsFoundations.innerHTML = ''
	$cardsStack.innerHTML = ''
}

function updateMovementsCounterUI() {
	$movementsCount.textContent = STATES.gameboard.movements.length.toString().padStart(2, '0')
	$movementsContainer.classList.remove('hidden')
}

function addMovement(movement: Omit<Movement, 'id'>, type: 'undo' | 'redo' = 'undo') {
	const id = getUIID()
	const movementKey = type === 'undo' ? 'movements' : 'redoMovements'
	STATES.gameboard[movementKey].push({ id, ...movement })
	console.log({ movement, type })

	updateRedoUndoButton()
	updateMovementsCounterUI()
}

function updateRemainingStackTurnsUI() {
	$remainingStackTurnsText.textContent = String(STATES.remainingStackTurns)
	if (STATES.remainingStackTurns <= 0) $remainingStackTurns.classList.add('empty')
	else $remainingStackTurns.classList.remove('empty')
}

function pauseGame() {
	STATES.playing = false
	provitionalSettings = structuredClone(STATES.settings)

	pauseTimer()
	openModal({ id: 'game-paused-dialog' })
	updatePauseGameUI()
}

function unPauseGame() {
	closeModal({ id: 'game-paused-dialog' })
	showInfoUI()
	STATES.playing = true

	continueTimer()
}

function main() {
	// Añadir la eschucha de eventos globales
	addGlobalEventListeners()
	// Crear el esquema del juego
	setGameSketch()

	// Asignar la posición del contador de vueltas de stack restantes
	const { x, y, stackSeparatorSpace, maxStackIndex } = getStackCoors('stack')
	$remainingStackTurns.style.setProperty('--x', `${x}px`)
	updateRemainingStackTurnsUI()

	// Actualizar el estado de los togglers
	updateTogglerUI()

	// Actualizar el la ui de la dificultad
	updateDifficultyUI()

	// Actualizar la ui del modal de pausa
	updatePauseGameUI()

	setTimeout(() => {
		openModal({ id: 'main-options-dialog' })
	}, 200)

	const showCardFromStackWidth = CARD_STATE.width + stackSeparatorSpace * maxStackIndex

	$showCardFromStack.style.setProperty('--show-card-from-stack-y', `${y}px`)
	$showCardFromStack.style.setProperty('--show-card-from-stack-x', `${x}px`)
	$showCardFromStack.style.setProperty(
		'--show-card-from-stack-width',
		`${showCardFromStackWidth}px`
	)

	// setTimeout(() => {
	//   closeModal({ id: 'main-options-dialog' })
	//   openModal({ id: 'end-game-dialog' })
	//   updateWinModalUI()
	// }, 200)
}

function handleChangeDifficulty(event: MouseEvent | TouchEvent) {
	const $difficulty = event.currentTarget as HTMLButtonElement
	const difficulty = $difficulty.dataset.difficulty as Difficulties
	changeDifficulty(difficulty)
}

function handleDocumentClick() {
	playSound({ id: 'music', vol: 0.05, loop: true })

	document.removeEventListener('click', handleDocumentClick)
}

function hideInfoUI() {
	$counterContainer.classList.add('hidden')
	$timeContainer.classList.add('hidden')
	$movementsContainer.classList.add('hidden')
	$remainingStackTurns.classList.add('hidden')
	$actionsContainer.classList.add('hidden')
}

function showInfoUI() {
	$counterContainer.classList.remove('hidden')
	if (STATES.settings.isTimerActive) $timeContainer.classList.remove('hidden')
	if (STATES.settings.isMovementsCounterActive) $movementsContainer.classList.remove('hidden')
	if (STATES.settings.difficulty === 'hard') $remainingStackTurns.classList.remove('hidden')

	$actionsContainer.classList.remove('hidden')
}

function updatePauseGameUI() {
	const difficulty = STATES.settings.difficulty
	const isTimerActive = STATES.settings.isTimerActive
	const isMovementsCounterActive = STATES.settings.isMovementsCounterActive
	const cardsInFoundations = Object.values(STATES.gameboard.foundations).reduce(
		(acc, foundation) => acc + foundation.cards.length,
		0
	)
	const cardsInStack = STATES.gameboard.stacked.cards.length + STATES.gameboard.showed.cards.length
	const { hours, minutes } = getFormattedTime()
	const {
		hours: hoursString,
		minutes: minutesString,
		seconds: secondsString
	} = formattedTimeToFormattedString()

	let timeString = ''

	if (hours > 0) timeString = `${hoursString}:`
	if (minutes > 0) timeString += `${minutesString}:`
	timeString += secondsString

	$statsDifficultyBadgeIndicator.dataset.difficulty = difficulty
	$statsTimerCheckbox.dataset.active = isTimerActive.toString()
	$statsMovementsCheckbox.dataset.active = isMovementsCounterActive.toString()
	$statsUndoRedoCheckbox.dataset.active = isMovementsCounterActive.toString()

	$statsFoundationsCards.textContent = `${cardsInFoundations}/52`
	$statsStackCards.textContent = String(cardsInStack)
	$pausedMovementsCount.textContent = String(STATES.gameboard.movements.length).padStart(2, '0')
	$pausedTimeCount.textContent = timeString
}

async function handleRestarGame() {
	const reset = confirm('¿Estas seguro de que quieres reiniciar el juego?')

	if (!reset) return

	const gameboard = structuredClone(STATES.initialGameboard)
	if (!gameboard) return

	closeModal({ id: 'game-paused-dialog' })
	hideInfoUI()

	const cards = gameboard.cards

	for (const card of cards) {
		const { x: xStandBy, y: yStandBy } = getZoneCoords('cards-stand-by')
		const cardElement = document.getElementById(card.id) as HTMLDivElement
		moveCard({ card: cardElement, x: xStandBy, y: yStandBy })

		updateZoneSize({ zoneId: card.zoneId, cards: [] })

		setTimeout(() => cardElement.classList.add('card-setting-up'), MOVING_CARD_DURATION / 4)
	}

	await new Promise((resolve) => setTimeout(resolve, 600))

	STATES.gameboard.cards = gameboard.cards

	const gameboardCopy = structuredClone(gameboard)

	await resetGame({ gameboard: gameboardCopy })

	STATES.isFirstMoveMade = false
	STATES.gameboard.redoMovements = []
	STATES.gameboard.movements = []
	STATES.time.time = 0
	STATES.playing = true
	STATES.remainingStackTurns = STACK_TURNS

	updateMovementsCounterUI()
	updateRemainingStackTurnsUI()
	updateTimer()

	showInfoUI()
}

function formattedTimeToFormattedString() {
	const { hours, minutes, seconds } = getFormattedTime()

	return {
		hours: hours.toString().padStart(2, '0'),
		minutes: minutes.toString().padStart(2, '0'),
		seconds: seconds.toString().padStart(2, '0')
	}
}

async function syncUIWithData({ gameboard }: { gameboard: Gameboard }) {
	const { showed, stacked, zones, foundations } = gameboard

	async function moveToStackedShowed(zone: ShowedZone | StackedZone) {
		const cards = zone.cards

		for (const [indexCard, card] of cards.entries()) {
			const $card = document.getElementById(card.id) as HTMLDivElement
			const cardData = getCardDataById({ id: card.id })
			const side = zone.zone === 'stacked' ? 'stack' : 'show'

			if (!cardData || !$card) continue

			const { x, y } = getStackCoors(side, indexCard)
			moveCard({ card: $card, x, y })
			setTimeout(() => {
				$card.classList.remove('card-setting-up')
			}, MOVING_CARD_DURATION / 4)

			updateCardElement({ card: $card, cardData })

			if (cardData.flipped) $card.addEventListener('dblclick', handleDoubleClick)
			playSound({ id: 'show-card' })

			await new Promise((resolve) => setTimeout(resolve, 100))
		}
	}

	async function moveToZones() {
		const zonesEntries = Object.entries(zones)

		for (const [_, zoneData] of zonesEntries) {
			const cards = zoneData.cards

			updateZoneSize({ zoneId: zoneData.id })

			for (const card of cards) {
				const $card = document.getElementById(card.id) as HTMLDivElement
				const cardData = getCardDataById({ id: card.id })

				if (!cardData || !$card) continue

				const { x, y } = getZoneCoords(zoneData.id)
				moveCard({ card: $card, x, y })

				setTimeout(() => {
					$card.classList.remove('card-setting-up')
				}, MOVING_CARD_DURATION / 4)

				updateCardElement({ card: $card, cardData })

				if (cardData.flipped) $card.addEventListener('dblclick', handleDoubleClick)
				updateZoneSize({ zoneId: zoneData.id })
				playSound({ id: 'show-card' })

				await new Promise((resolve) => setTimeout(resolve, 100))
			}
		}
	}

	async function moveToFoundations() {
		const foundationsEntries = Object.entries(foundations)

		for (const [foundationId, foundationData] of foundationsEntries) {
			const cards = foundationData.cards
			for (const card of cards) {
				const $card = document.getElementById(card.id) as HTMLDivElement
				const cardData = getCardDataById({ id: card.id })

				if (!cardData || !$card) continue

				const { x, y } = getZoneCoords(foundationId)
				moveCard({ card: $card, x, y })
				setTimeout(() => {
					$card.classList.remove('card-setting-up')
				}, MOVING_CARD_DURATION / 4)
				updateCardElement({ card: $card, cardData })
				playSound({ id: 'show-card' })

				if (cardData.flipped) $card.addEventListener('dblclick', handleDoubleClick)

				await new Promise((resolve) => setTimeout(resolve, 100))
			}
		}
	}

	await Promise.all([
		moveToStackedShowed(showed),
		moveToStackedShowed(stacked),
		moveToZones(),
		moveToFoundations()
	])

	showInfoUI()
}

function updateWinModalUI() {
	const difficulty = STATES.settings.difficulty
	const isTimerActive = STATES.settings.isTimerActive
	const isMovementsCounterActive = STATES.settings.isMovementsCounterActive
	const { hours, minutes } = getFormattedTime()
	const {
		hours: hoursString,
		minutes: minutesString,
		seconds: secondsString
	} = formattedTimeToFormattedString()

	let timeString = ''

	if (hours > 0) timeString = `${hoursString}:`
	if (minutes > 0) timeString += `${minutesString}:`
	timeString += secondsString

	$winDifficultyBadgeIndicator.dataset.difficulty = difficulty
	$winTimerCheckbox.dataset.active = isTimerActive.toString()
	$winMovementsCount.textContent = String(STATES.gameboard.movements.length).padStart(2, '0')
	$winTimeCount.textContent = timeString
	$winMovementsCount.dataset.active = isMovementsCounterActive.toString()
}

function muteAllSounds() {
	Object.values(SOUNDS).forEach((sound) => {
		sound.muted = true
	})
}

function unmuteAllSounds() {
	Object.values(SOUNDS).forEach((sound) => {
		sound.muted = false
	})
}

async function handleOmitEndAnimation() {
	const foundationsEntries = Object.entries(STATES.gameboard.foundations)
	const allCardsInFoundations = foundationsEntries.flatMap(([_, f]) => f.cards)

	for (const card of allCardsInFoundations) {
		const $card = document.getElementById(card.id) as HTMLDivElement

		if (!$card) continue

		const { x, y } = getZoneCoords('cards-stand-by')
		moveCard({ card: $card, x, y })

		setTimeout(() => {
			$cardsContainer.removeChild($card)
		}, MOVING_CARD_DURATION + 100)
	}
}

function generateUUIDFallback(): string {
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
		const r = (Math.random() * 16) | 0
		const v = c === 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

function getUIID() {
	if (crypto.randomUUID) return crypto.randomUUID()
	return generateUUIDFallback()
}

function setRedoMovements(movements: Movement[]) {
	STATES.gameboard.redoMovements = movements

	updateRedoUndoButton()
}

function getIsLastCardFlipped({ zoneData }: { zoneData: Zone | undefined }) {
	if (!zoneData) return false

	const lastCardInZone = zoneData.cards.at(-1)
	const fromZoneLastCardData = getCardDataById({ id: lastCardInZone?.id ?? '' })
	const fromZoneLastCardIsFlipped = fromZoneLastCardData?.flipped ?? false

	return fromZoneLastCardIsFlipped
}

main()
