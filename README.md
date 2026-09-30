# SafeSignal — Frontend Web Application

[![Organization](https://img.shields.io/badge/Organization-DEJAMICE-blue)](https://github.com/DEJAMICE)
[![Tech Stack](https://img.shields.io/badge/Stack-Vue%203%20%7C%20Vite%20%7C%20PrimeVue%20%7C%20Axios-green)](#)
[![Course](https://img.shields.io/badge/UPC-Dise%C3%B1o%20de%20Experimentos%20de%20Software-red)](#)

Aplicación Web de Monitoreo y Gestión Ciudadana para la plataforma **SafeSignal**, desarrollada para el curso *Diseño de Experimentos de Software* (UPC).

---

## 🏗️ Tech Stack

* **Framework:** Vue 3 (Composition API / `<script setup>`)
* **Build Tool:** Vite
* **UI Component Library:** PrimeVue + PrimeIcons
* **HTTP Client & Integration Layer:** Axios (con interceptores JWT y modo mock)
* **Routing & State:** Vue Router 4 + Pinia
* **Mapas:** Leaflet / OpenStreetMap

---

## 👥 Responsabilidades en el Repositorio

* **Persona 3 (Mathias Andree Cárdenas Huamán):**
  * Diseño e implementación de la capa central de integración de servicios HTTP (`src/services/api.js`).
  * Módulos de servicios para Alertas SOS (`alerts.service.js`) y Seguimiento de Rutas (`tracking.service.js`).
  * Soporte de interceptores JWT, gestión de errores y Mock Data para desacoplar el desarrollo de frontend y backend.
* **Persona 4:**
  * Módulo A: Autenticación, Login, Registro y Perfil de Usuario (`/login`, `/register`, `/profile`).
* **Persona 5:**
  * Módulo B: Rutas seguras, mapa de calor interactivo, botón SOS web y gestión de dispositivos IoT (`/routes`, `/alerts`, `/devices`).

---

## 🌿 Metodología GitFlow

Este repositorio aplica el flujo **GitFlow**:
* `main`: Código en producción y releases estables.
* `develop`: Integración de módulos de desarrollo.
* `feature/Cardenas`: Desarrollo y mantenimiento de la capa de servicios HTTP y conector con Backend.

---

## 🚀 Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar en entorno de desarrollo local
npm run dev

# 3. Compilar para producción
npm run build
```