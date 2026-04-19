# UTP Tracker

Aplicación web de seguimiento académico universitario para estudiantes de Ingeniería de Sistemas e Informática de la Universidad Tecnológica del Perú (UTP).

## Características

### Dashboard
- **Métricas principales**: Avance de cursos, créditos completados, promedio ponderado
- **Gráficos interactivos**: Distribución por estado y promedio por ciclo
- **Barra de progreso motivacional**: Estilo videojuego con proyección de egreso
- **Alertas inteligentes**: Sistema de alertas para cursos en riesgo
- **Cursos actuales**: Vista rápida de los cursos en curso con indicadores de riesgo
- **Exportar**: Captura del dashboard como imagen PNG

### Gestión de Cursos
- **Vista organizada por ciclo**: Cursos agrupados y colapsables por ciclo
- **Búsqueda y filtros**: Búsqueda por nombre/código y filtros por estado
- **Edición de notas**: Ingreso y edición de evaluaciones con validación
- **Cálculo automático**: Promedio ponderado en tiempo real
- **Calculadora de notas**: "¿Cuánto necesito para aprobar?"
- **Agregar evaluaciones**: Añade evaluaciones personalizadas a tus cursos

### Historial y Análisis
- **Timeline visual**: Línea de tiempo con todos los ciclos completados
- **Evolución del promedio**: Gráfico de línea con tendencia histórica
- **Detalles por ciclo**: Promedio, créditos y lista de cursos por ciclo

### Calculadora/Simulador
- **Simulación de escenarios**: Prueba diferentes notas hipotéticas
- **Vista en tiempo real**: Observa cómo cambia tu promedio
- **Aplicar notas**: Guarda las notas simuladas si te satisfacen

## Sistema de Alertas

- **CRÍTICO** (rojo): Promedio < 8 O nota mínima necesaria > 18
- **ADVERTENCIA** (amarillo): Promedio 8-11.4 O nota mínima necesaria 14-18
- **BIEN** (verde): Promedio ≥ 11.5
- **SIN DATOS** (gris): Sin evaluaciones registradas

## Stack Técnico

- **React 19** + **Vite 8** - Framework y bundler
- **TypeScript 6** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **Recharts 3** - Gráficos interactivos
- **Zustand 5** - Estado global
- **html2canvas** - Exportar dashboard
- **LocalStorage** - Persistencia de datos

## Instalación

```bash
# Instalar dependencias
npm install

# Modo desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa de producción
npm run preview
```

## Uso

1. **Navega** entre las diferentes secciones usando el menú lateral (desktop) o inferior (móvil)
2. **Busca y filtra** tus cursos en la sección "Mis cursos"
3. **Ingresa notas** expandiendo cada curso y editando las evaluaciones
4. **Monitorea tu progreso** en el Dashboard con métricas y gráficos
5. **Simula escenarios** en la Calculadora para planificar tus estudios
6. **Alterna** entre modo claro y oscuro según tu preferencia

## Características de Diseño

- **Responsive**: Optimizado para desktop, tablet y móvil
- **Dark mode**: Soporte completo para modo oscuro
- **Animaciones suaves**: Transiciones y efectos visuales
- **Accesibilidad**: Colores con buen contraste y navegación por teclado
- **Persistencia**: Tus datos se guardan automáticamente en el navegador

## Datos del Estudiante

- **Nombre**: Fernandez Hernandez, Ademir Alfredo
- **Programa**: Ingeniería de Sistemas e Informática (SIST26P2A)
- **Nota mínima aprobatoria**: 11.5 / 20

## Modelo de Datos

Todos los datos se almacenan localmente en el navegador usando LocalStorage:

- **Cursos**: 138 cursos en 10 ciclos
- **Estados**: Aprobado, Convalidado, En curso, Pendiente
- **Tipos**: Obligatorio, Electivo
- **Evaluaciones**: Cada evaluación con peso y nota

## Estructura del Proyecto

```
src/
├── components/
│   ├── Dashboard/       # Componentes del dashboard
│   ├── Courses/         # Gestión de cursos
│   ├── History/         # Historial y análisis
│   ├── Calculator/      # Simulador de notas
│   └── shared/          # Componentes compartidos
├── store/               # Estado global (Zustand)
├── utils/               # Funciones de cálculo
├── data/                # Datos iniciales
├── types/               # Definiciones TypeScript
└── App.tsx             # Componente principal
```

## Licencia

Proyecto personal - Uso libre

---

Desarrollado con React, TypeScript y Tailwind CSS
