# 🃏 Solitario Clásico

> Una implementación moderna y elegante del clásico juego de Solitario (Klondike) con TypeScript, TailwindCSS y animaciones fluidas.

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Bun](https://img.shields.io/badge/Bun-000000?style=for-the-badge&logo=bun&logoColor=white)](https://bun.sh)

---

## ✨ Características

- 🎮 **Jugabilidad Clásica**: Implementación fiel del Solitario Klondike tradicional
- 🎨 **Interfaz Moderna**: Diseño limpio y responsivo con TailwindCSS
- 🖱️ **Drag & Drop**: Arrastra y suelta cartas con animaciones suaves
- 📱 **Soporte Táctil**: Funciona perfectamente en dispositivos móviles y tablets
- ⏱️ **Cronómetro**: Rastrea tu tiempo de juego
- 📊 **Contador de Movimientos**: Monitorea tus movimientos para mejorar tu estrategia
- ↩️ **Deshacer/Rehacer**: Sistema completo de undo/redo para corregir errores
- 🎯 **Doble Click Inteligente**: Mueve cartas automáticamente a posiciones válidas
- 🔊 **Efectos de Sonido**: Feedback auditivo inmersivo
- 🏆 **Detección de Victoria**: Celebra tus triunfos con animaciones especiales
- 💾 **Persistencia de Estado**: Tu progreso se guarda automáticamente
- 🎚️ **Niveles de Dificultad**: Modos fácil y difícil

---

## 🚀 Inicio Rápido

### Prerrequisitos

Asegúrate de tener instalado [Bun](https://bun.sh) en tu sistema:

```bash
curl -fsSL https://bun.sh/install | bash
```

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/solitario-v3.git
   cd solitario-v3
   ```

2. **Instala las dependencias**
   ```bash
   bun install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   bun run dev
   ```

4. **Abre tu navegador**
   
   Navega a `http://localhost:3000` y ¡comienza a jugar!

---

## 🎮 Cómo Jugar

### Objetivo
Organiza todas las cartas en las cuatro pilas de fundación, ordenadas por palo desde el As hasta el Rey.

### Reglas Básicas

- **Pilas de Fundación**: Comienzan con el As y se construyen en orden ascendente (A, 2, 3... K) del mismo palo
- **Columnas de Juego**: Se construyen en orden descendente alternando colores (rojo-negro)
- **Pila de Descarte**: Voltea cartas del mazo para usarlas en el juego
- **Reyes**: Solo los Reyes pueden colocarse en columnas vacías

### Controles

| Acción | Método |
|--------|--------|
| Mover carta | Arrastra y suelta |
| Movimiento automático | Doble click en la carta |
| Voltear carta del mazo | Click en el mazo |
| Deshacer movimiento | Botón "Deshacer" |
| Rehacer movimiento | Botón "Rehacer" |
| Nuevo juego | Botón "Nuevo Juego" |

---

## 🛠️ Tecnologías

### Core
- **[TypeScript](https://www.typescriptlang.org/)**: Tipado estático para mayor robustez
- **[Bun](https://bun.sh)**: Runtime ultrarrápido de JavaScript
- **[TailwindCSS](https://tailwindcss.com/)**: Framework de utilidades CSS

### Herramientas de Desarrollo
- **[Biome](https://biomejs.dev/)**: Linter y formateador de código
- **[Concurrently](https://www.npmjs.com/package/concurrently)**: Ejecución paralela de scripts
- **[lite-server](https://www.npmjs.com/package/lite-server)**: Servidor de desarrollo ligero
- **[html-minifier-terser](https://www.npmjs.com/package/html-minifier-terser)**: Minificación de HTML

---

## 📦 Scripts Disponibles

```bash
# Desarrollo con hot-reload
bun run dev

# Compilar TypeScript
bun run build:js

# Compilar CSS con TailwindCSS
bun run build:css

# Minificar HTML
bun run build:html

# Build completo
bun run build:all

# Iniciar servidor de producción
bun run start
```

---

## 🏗️ Arquitectura del Proyecto

```
solitario-v3/
├── src/
│   ├── index.html      # Estructura HTML principal
│   ├── main.ts         # Lógica del juego en TypeScript
│   └── style.css       # Estilos con TailwindCSS
├── dist/               # Archivos compilados
├── package.json        # Dependencias y scripts
├── tsconfig.json       # Configuración de TypeScript
└── biome.json         # Configuración de Biome
```

### Componentes Principales

#### 🎴 Sistema de Cartas
- **Creación dinámica**: Generación de 52 cartas con SVG
- **Estados**: Volteada, apilada, mostrada, en zona
- **Animaciones**: Transiciones suaves para movimientos y volteos

#### 🎯 Zonas de Juego
- **7 Columnas**: Área principal de juego
- **4 Fundaciones**: Pilas objetivo por palo
- **Mazo**: Pila de cartas sin usar
- **Descarte**: Cartas volteadas del mazo

#### 🧠 Lógica de Juego
- **Validación de movimientos**: Reglas estrictas del Solitario
- **Detección de victoria**: Verificación automática
- **Sistema de movimientos**: Historial completo con undo/redo
- **Persistencia**: LocalStorage para guardar progreso

---

## 🎨 Características Técnicas Destacadas

### Drag & Drop Avanzado
```typescript
// Soporte para mouse y touch events
handleMouseDown(event: MouseEvent | TouchEvent)
handleMouseMove(event: MouseEvent | TouchEvent)
handleMouseUp(event: MouseEvent | TouchEvent)
```

### Sistema de Estado Reactivo
```typescript
interface States {
  playing: boolean
  gameboard: Gameboard
  time: { time: number; interval: NodeJS.Timeout | null }
  movements: Movement[]
  settings: Settings
}
```

### Validación de Movimientos
```typescript
function getIsValidCard({ cardData, zoneData }: {
  cardData: Card
  zoneData: Zone | Foundation
}): boolean
```

---

## 🎯 Roadmap

- [ ] Modo multijugador competitivo
- [ ] Estadísticas detalladas y gráficos
- [ ] Temas personalizables
- [ ] Más variantes de Solitario (Spider, FreeCell)
- [ ] Sistema de logros y desafíos diarios
- [ ] PWA con soporte offline
- [ ] Modo oscuro/claro

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Si quieres mejorar el juego:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Consulta el archivo `LICENSE` para más detalles.

---

## 👨‍💻 Autor

Desarrollado con ❤️ y ☕

---

## 🙏 Agradecimientos

- Inspirado en el clásico Solitario de Windows
- Iconos de cartas diseñados con SVG
- Efectos de sonido de dominio público

---

<div align="center">

**¿Te gustó el proyecto? ¡Dale una ⭐ en GitHub!**

[Reportar Bug](https://github.com/tu-usuario/solitario-v3/issues) · [Solicitar Feature](https://github.com/tu-usuario/solitario-v3/issues)

</div>
