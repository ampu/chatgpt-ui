<template>
  <VRow>
    <VCol>
      <v-hover
        v-slot="{ isHovering, props }"
        open-delay="100"
      >
        <v-card
          :elevation="isHovering ? 3 : 0"
          v-bind="props"
          variant="tonal"
        >
          <v-card-text class="text-center">
            <slot/>
          </v-card-text>
        </v-card>
      </v-hover>
    </VCol>
  </VRow>
</template>
