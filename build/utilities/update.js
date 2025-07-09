import log from "./structs/log.js";

export class Update {
    static async checkForUpdate(currentVersion) {
        try {
            const res = await fetch('https://raw.githubusercontent.com/Nexus-FN/DabushOG/main/package.json');
            if (!res.ok) {
                log.warn(`Update check failed with status ${res.status}`);
                return;
            }
            const packageJson = await res.json();
            log.debug(`Latest version: ${packageJson.version}`);
            log.debug(`Current version: ${currentVersion}`);
            const latestVersionNumber = packageJson.version.replace(/\./g, "");
            const currentVersionNumber = currentVersion.replace(/\./g, "");
            if (parseFloat(latestVersionNumber) > parseFloat(currentVersionNumber)) {
                const message = `Update available! ${currentVersion} -> ${packageJson.version}`;
                log.warn(`${message}\nDownload it from the GitHub repo or repull the image if you're using Docker`);
            }
        } catch (error) {
            log.warn(`Update check failed: ${error.message}`);
        }
    }
}
