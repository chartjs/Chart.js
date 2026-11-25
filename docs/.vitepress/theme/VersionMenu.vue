<script lang="ts">
import { fetchVersions, type Version } from './versions.ts';

// One request per page load, shared by the nav bar and the nav screen.
let refresh: Promise<Version[]> | undefined;
</script>

<script setup lang="ts">
// The default theme does not export its nav menu components; they are used
// here so the version menu looks like the rest of the nav.
import VPNavBarMenuGroup from 'vitepress/dist/client/theme-default/components/VPNavBarMenuGroup.vue';
import VPNavScreenMenuGroup from 'vitepress/dist/client/theme-default/components/VPNavScreenMenuGroup.vue';
import { computed, onMounted, shallowRef } from 'vue';
import marker from '../docs-version.json';
import { versionMenu } from './versions.ts';
import { data as built } from './versions.data.ts';

defineProps<{screen?: boolean}>();

// Written by scripts/docs-config.sh; number is absent for master.
const {version, number} = marker as {version: string; number?: string};

const versions = shallowRef<Version[]>(built);
const menu = computed(() => versionMenu({version, number, versions: versions.value}));
const items = computed(() => [
  {text: 'Documentation', items: menu.value.documentation},
  ...(menu.value.releaseNotes.length ? [{text: 'Release notes (5 latest)', items: menu.value.releaseNotes}] : []),
]);

onMounted(async () => {
  try {
    versions.value = await (refresh ??= fetchVersions());
  } catch (error) {
    console.warn(`Could not refresh the published versions: ${(error as Error).message}`);
  }
});
</script>

<template>
  <VPNavScreenMenuGroup v-if="screen" class="VersionMenu" :text="menu.title" :items="items" />
  <VPNavBarMenuGroup v-else class="VersionMenu bar" :item="{text: menu.title, items}" />
</template>

<style scoped>
/* Below 768px the nav screen, opened from the hamburger, has the menu. */
.bar {
  display: none;
}

@media (min-width: 768px) {
  .bar {
    display: block;
    margin-right: 12px;
  }
}
</style>
