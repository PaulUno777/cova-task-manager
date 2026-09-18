# COVA Task Manager

**A modern full-stack task management application built for the COVA Full-Stack Developer technical assessment.**

![CI](https://github.com/PaulUno777/cova-task-manager/actions/workflows/ci.yml/badge.svg)![Java 21](https://img.shields.io/badge/Java-21-ED8B00?logo=openjdk&logoColor=white)![Spring Boot](https://img.shields.io/badge/Spring%20Boot-6DB33F?logo=springboot&logoColor=white)![React](https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=black)![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)![MySQL](https://img.shields.io/badge/MySQL-4479A1?logo=mysql&logoColor=white)![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white)

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Getting Started](#getting-started) · [API](#api) · [Testing](#testing) · [Deployment](#deployment) · [Documentation](#documentation)

---

## Overview

COVA Task Manager is a responsive task management application
developed as part of the COVA Full-Stack Developer technical
assessment.

The application allows authenticated users to create, manage,
search and filter their personal tasks through a modern web
interface.

The backend exposes a REST API designed to be consumed by both
the React web application and the optional Flutter mobile client.

The implementation focuses on:

- clean and maintainable code
- secure authentication
- clear API boundaries
- responsive UX
- automated testing
- containerization
- CI/CD
- straightforward architecture without unnecessary complexity

---

## Features

### Authentication

- User registration
- User login
- JWT authentication
- Secure password hashing
- Protected API endpoints

### Task management

- Create tasks
- Edit tasks
- Delete tasks
- View personal tasks
- Filter by status
- Search tasks
- Pagination

### UX

- Responsive interface
- COVA-inspired visual direction
- Loading states
- Empty states
- Error handling
- Form validation
- Toast feedback
- Accessible interactions

### Engineering

- Spring Boot REST API
- Spring Security
- Spring Data JPA
- MySQL
- H2 development/test profile
- React + Vite + TypeScript
- TanStack Query
- Docker
- GitHub Actions
- Google Cloud deployment

---

## Architecture

The application uses a **modular monolith**.

The domain is intentionally small, so the architecture avoids
unnecessary distributed systems and infrastructure.

```text
                       ┌───────────────┐
                       │     User      │
                       └───────┬───────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             React Web App        Flutter Mobile
                                     (optional)
                    │                     │
                    └──────────┬──────────┘
                               │
                          HTTPS / JSON
                               │
                       ┌───────▼────────┐
                       │  Spring Boot   │
                       │      API       │
                       ├────────────────┤
                       │ Spring Security│
                       │ Controllers    │
                       │ Services       │
                       │ Repositories   │
                       └───────┬────────┘
                               │
                          Spring Data JPA
                               │
                       ┌───────▼────────┐
                       │     MySQL      │
                       └────────────────┘
```
