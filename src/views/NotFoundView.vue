<template>
    <div class="min-h-screen bg-gray-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 class="mt-6 text-center text-6xl font-extrabold text-gray-900">
            4<span class="text-[#b1291d]">0</span>4
          </h2>
          <p class="mt-2 text-center text-xl text-gray-600">
            Oops! Página no encontrada
          </p>
        </div>
        <div class="mt-8">
          <p class="text-gray-500 mb-6">
            Lo sentimos, la página que estás buscando no existe o ha sido movida.
          </p>
          <router-link
            to="/"
            class="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-[#b1291d] hover:bg-[#991c14] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#b1291d] transition-colors duration-300"
          >
            Volver al inicio
          </router-link>
        </div>
        <div class="mt-12">
          <svg class="mx-auto h-24 w-24 text-[#b1291d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  </script>