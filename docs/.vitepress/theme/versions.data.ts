import { defineLoader } from 'vitepress';
import { fetchVersions, type Version } from './versions.ts';

// The versions published when the site was built, for when the browser cannot
// fetch the list. Without their npm tags: those change with the next release,
// and the menu judges what is current when the page is opened.
declare const data: Version[];
export {data};

export default defineLoader({
  async load(): Promise<Version[]> {
    try {
      return (await fetchVersions()).map((version) => ({...version, tag: null}));
    } catch (error) {
      // A docs build must not depend on jsDelivr. The menu still offers
      // master, latest and the version being built.
      console.warn(`Could not list the published versions: ${(error as Error).message}`);
      return [];
    }
  },
});
