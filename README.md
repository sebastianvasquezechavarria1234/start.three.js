<div align="center">

# Magic Particles 3D

### *Estrellas que danzan en el vacío*

<br>

[![Three.js](https://img.shields.io/badge/Three.js-0.160-000000?style=for-the-badge&logo=threedotjs&logoColor=white)](https://threejs.org)
[![WebGL](https://img.shields.io/badge/WebGL-1.0-990000?style=for-the-badge&logo=khronosgroup&logoColor=white)](https://www.khronos.org/webgl/)
[![License](https://img.shields.io/badge/License-MIT-0080FF?style=for-the-badge)](LICENSE)

<br>

Un sistema de partículas tridimensional donde 150 estrellas de ocho ramas siguen trayectorias armónicas en un espacio infinito. Cada estrella emite luz propia con una paleta de colores cuidadosamente calibrada, creando una experiencia visual que se siente viva.

<br>

<img src="https://via.placeholder.com/900x500/0a0a0f/ffffff?text=✨+Magic+Particles+3D" alt="Vista previa del sistema de partículas" width="100%" style="border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">

<br>

</div>

---

## Índice

- [Visión general](#visión-general)
- [Características](#características)
- [Tecnologías](#tecnologías)
- [Inicio rápido](#inicio-rápido)
- [Controles](#controles)
- [Arquitectura](#arquitectura)
- [Personalización](#personalización)
- [Rendimiento](#rendimiento)
- [Licencia](#licencia)

---

## Visión general

Magic Particles 3D es una exploración visual del movimiento armónico aplicado a sistemas de partículas. El proyecto nació de una pregunta simple: *¿Qué sucede cuando las estrellas obedecen las leyes de la música?*

Cada partícula es una estrella de ocho ramas — horizontal, vertical y diagonales — que se forma mediante cálculos matemáticos en el fragment shader. No hay texturas externas, no hay modelos predefinidos. Todo se genera en tiempo real usando únicamente la GPU.

El resultado es un campo de estrellas que respira, que pulsa, que se mueve con una organicidad inesperada para algo generado enteramente por código.

---

## Características

| Aspecto | Detalle |
|:--------|:--------|
| **Dimensionalidad** | Sistema completo en 3D con perspectiva y profundidad |
| **Renderizado** | Shader GLSL personalizado ejecutado en GPU |
| **Estrellas** | 8 ramas por estrella: 4 principales + 4 diagonales |
| **Colores** | 5 tonos con distribución porcentual calibrada |
| **Movimiento** | Trayectorias armónicas sinusoidales por eje |
| **Efectos** | Glow suave, parpadeo temporal, blending aditivo |
| **Interacción** | Navegación completa: rotación, paneo, zoom |
| **Rendimiento** | Optimizado para 60fps en hardware integrado |

### Paleta de colores

La distribución de colores no es aleatoria. Cada porcentaje fue elegido para crear un balance visual que se sienta natural:

```
Blanco puro       ████████████████████░░░░░░░░░░░░░░░░░░░░  45%
Blanco cálido     ██████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  25%
Azul suave        ██████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  15%
Naranja cálido    ████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  10%
Rojo tenue        ██░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░   5%
```

---

## Tecnologías

| Tecnología | Uso | Por qué |
|:-----------|:----|:--------|
| **Three.js 0.160** | Motor de renderizado 3D | La bibliografía más madura para WebGL en JavaScript |
| **GLSL** | Shaders de vértice y fragmento | Permite ejecutar cálculos complejos directamente en la GPU |
| **OrbitControls** | Navegación de cámara | Interacción intuitiva sin código adicional |
| **ES Modules** | Sistema de módulos | Importaciones nativas del navegador, sin bundler necesario |

No hay dependencias de build. No hay bundler. No hay transpilación. El código se ejecuta tal cual lo escribe el navegador.

---

## Inicio rápido

### Requisitos

- Un navegador web actualizado
- Un servidor local (por restricciones de ES Modules)

### Instalación

```bash
git clone https://github.com/tu-usuario/magic-particles-3d.git
cd magic-particles-3d
```

### Ejecución

Cualquiera de estas opciones funciona:

```bash
# Python (instalado por defecto en la mayoría de sistemas)
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Luego, abre `http://localhost:8000` en tu navegador.

> **Nota:** No se recomienda abrir `index.html` directamente como archivo (`file://`), ya que los ES Modules requieren un servidor HTTP para funcionar correctamente.

---

## Controles

| Acción | Input |
|:-------|:------|
| Rotar la escena | Click izquierdo + arrastrar |
| Desplazar la cámara | Click derecho + arrastrar |
| Acercar / alejar | Rueda del mouse |
| Restablecer vista | Recargar la página |

---

## Arquitectura

### Flujo de renderizado

```
┌─────────────────────────────────────────────────────────┐
│                     Cada frame                          │
├─────────────────────────────────────────────────────────┤
│                                                         │
│   1. Actualizar tiempo (uTime)                          │
│              ↓                                          │
│   2. Vertex Shader: calcular posición 3D                │
│      └─ Aplicar movimiento armónico sinusoidal          │
│              ↓                                          │
│   3. Rasterizar puntos como quads                       │
│              ↓                                          │
│   4. Fragment Shader: dibujar estrella de 8 ramas       │
│      ├─ Calcular distancia al centro                    │
│      ├─ Calcular distancias a cada rama                 │
│      ├─ Combinar intensidades                           │
│      ├─ Seleccionar color según distribución            │
│      └─ Aplicar glow y alpha                            │
│              ↓                                          │
│   5. Blending aditivo sobre framebuffer                 │
│              ↓                                          │
│   6. Mostrar en pantalla                                │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Estructura del código

```
magic-particles-3d/
├── index.html        →  Punto de entrada, carga de módulos
├── script.js         →  Escena, cámaras, shaders, animación
├── style.css         →  Reset CSS, canvas a pantalla completa
└── README.md         →  Este archivo
```

El proyecto es intencionalmente minimalista. Un solo archivo JavaScript contiene toda la lógica, incluyendo los shaders GLSL como template literals. Esta decisión facilita la experimentación: un solo archivo para editar, un solo lugar donde busca todo.

---

## Personalización

### Cantidad de partículas

```javascript
const NB_PARTICLES = 150;  // Aumentar o reducir según necesidad
```

> Más partículas significan más carga para la GPU. En hardware integrado, se recomienda mantener por debajo de 200.

### Velocidad del movimiento

Los tres ejes se controlan independientemente en el vertex shader:

```glsl
pos.y += sin(uTime * 0.5 + position.x * 0.1) * 1.0;  // Vertical
pos.x += cos(uTime * 0.3 + position.y * 0.1) * 0.8;  // Horizontal
pos.z += sin(uTime * 0.2 + position.z * 0.1) * 0.9;  // Profundidad
//         ↑          ↑                   ↑
//      Velocidad  Frecuencia         Amplitud
```

### Colores

La paleta se define en el fragment shader. Cada rango de `rand` controla la probabilidad de aparición:

```glsl
if (rand < 0.45)      baseColor = vec3(1.0, 1.0, 1.0);   // Blanco
else if (rand < 0.70) baseColor = vec3(1.0, 0.96, 0.84); // Cálido
else if (rand < 0.85) baseColor = vec3(0.66, 0.84, 1.0); // Azul
else if (rand < 0.95) baseColor = vec3(1.0, 0.71, 0.42); // Naranja
else                  baseColor = vec3(1.0, 0.48, 0.48); // Rojo
```

### Tamaño de las estrellas

```javascript
sizes[i] = Math.random() * 40 + 20;  // Rango: 20px a 60px
```

### Intensidad del glow

El efecto de halo se controla con el divisor en el fragment shader:

```glsl
float starIntensity = 1.0 / (dist * 200.0 + 0.02);
//                                     ↑
//                    Mayor valor = glow más pequeño
//                    Menor valor = glow más grande
```

---

## Rendimiento

El proyecto está optimizado para mantener 60fps en la mayoría de hardware:

| Factor | Optimización |
|:-------|:-------------|
| **GPU-bound** | Todos los cálculos pesados se ejecutan en el shader, no en CPU |
| **Sin texturas** | No hay carga de assets ni sampling de texturas |
| **Sin geometría compleja** | Solo Points con shader, no meshes triangulados |
| **Blending aditivo** | Menos overhead que blending alpha tradicional |
| **Sin deep copy** | Solo se actualiza la uniform `uTime` cada frame |

### Benchmarks referenciales

| Hardware | FPS estimado |
|:---------|:-------------|
| GPU dedicada (GTX 1060 o superior) | 60 fps constantes |
| GPU integrada (Intel UHD 620) | 55-60 fps |
| MacBook Air (M1) | 60 fps constantes |
| Móvil moderno (2022+) | 45-60 fps |

---

## Decisiones técnicas

**¿Por qué Points en lugar de instanced meshes?**

Las estrellas son esencialmente quads que siempre miran a la cámara. Los Points son la abstracción más eficiente para este caso: un solo draw call, un solo buffer de geometría, y el tamaño se controla directamente en el vertex shader.

**¿Por qué no usar un post-processor para el glow?**

El glow se logra matemáticamente en el fragment shader usando una función de atenuación inversa. Esto evita un render pass adicional y mantiene el pipeline simple.

**¿Por qué ES Modules sin bundler?**

Para eliminar fricción. No hay `npm install`, no hay configuración de webpack, no hay build step. El código se modifica y se recarga. Esto es ideal para experimentación y aprendizaje.

---

## Licencia

 Este proyecto se distribuye bajo la licencia MIT. Consulta el archivo [LICENSE](LICENSE) para más detalles.

```
MIT License - 2024
```

---

<div align="center">

*Generado con Three.js y curiosidad*

</div>
