<template>
  <VApp :theme="$colorMode.value">
    <NavigationDrawer/>
    <slot/>
  </VApp>
</template>
