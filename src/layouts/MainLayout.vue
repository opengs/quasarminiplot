<template>
  <q-layout view="hHh lpR fFf" class="bg-white">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script lang="ts">

import { Vue, Component } from 'vue-property-decorator'

@Component({
  components: { }
})
export default class MainLayout extends Vue {
  leftDrawerOpen = false;
  essentialLinks = []
}
</script>
