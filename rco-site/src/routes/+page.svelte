<script lang="ts">
  import type { AvailableTab } from './index/Tabs/AvailableTab';
  import Nl from './index/Tabs/Nl.svelte';
  import TabItem from './index/Tabs/TabItem.svelte';
  import Tabs from './index/Tabs/Tabs.svelte';
  let value: AvailableTab = 'What are flags?';
</script>

<svelte:head>
  <title>RCO - Hello, World!</title>
</svelte:head>

<main>
  <section class="top" style="display:flex">
    <div>
      <img
        src="/rco.png"
        alt="RCO"
        style="max-height:6em;height:192px;height:96px;"
        width="192"
        height="96"
      />
      <h1>Roblox Client Optimizer</h1>
      <p>A tool to optimize Roblox's client</p>
      <div style="opacity: 0.7">
        <h2 id="about">About</h2>
        <p>
          Roblox Client Optimizer tweaks flags to optimize your Roblox client.<br
          />
          Click
          <a href="/download">here</a> to download our latest version.
        </p>
      </div>
    </div>
    <!-- once we have more content: -->
    <!-- <div style="position:absolute;bottom:1ch;color:#ddda;font-size:1.05rem;">
      <p style="margin-bottom: -0.4em;">Scroll down for more</p>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="48"
        width="48"
        fill="#ddddddaa"
        ><path d="m24 30.75-12-12 2.15-2.15L24 26.5l9.85-9.85L36 18.8Z" /></svg
      >
    </div> -->
  </section>
  <section>
    <h2 id="faq" style="margin-bottom:0.5em">FAQ</h2>
    <div class="tabs">
      <Tabs bind:value>
        <TabItem currentTab={value} tab={'Is RCO Safe?'}>
          <p>
            Yes, RCO is safe.<br />
            We do not collect any data from your computer, and we do not distribute
            any malware.<br />
            Don't believe us? <a href="/source">Read the Source Code</a> - we're
            FOSS!
          </p>
        </TabItem>
        <TabItem currentTab={value} tab={'What are flags?'}>
          <p>
            Flags are settings that Roblox uses to control the client.<br />
            They can be used to enable or disable features, or to change how the
            client works.
          </p>
        </TabItem>
        <TabItem currentTab={value} tab={'Will I get banned for using this?'}>
          <p>
            No, our operations are fully compliant with the <a
              href="https://help.roblox.com/hc/articles/115004647846-Roblox-Terms-of-Use"
              >Roblox Terms of Use</a
            >,<br />
            and we use a method that Roblox themselves intentionally added to the
            client to modify flags.
          </p>
        </TabItem>
        <TabItem
          currentTab={value}
          tab={'Will the software slow down my computer?'}
        >
          <p>
            No, the software is very lightweight and only checks for updates to
            our flag list and updates to itself.
          </p>
        </TabItem>
        <TabItem currentTab={value} tab={'Why not manually install flags?'}>
          <p>
            Manually installing flags is time consuming.<br />
            In addition, if a major bug is found within the flag file, there is no
            way for us to notify you to update it.
          </p>
        </TabItem>
      </Tabs>
    </div>
    <p style="margin: 0.2ch">
      <a href="/qna">More detailed answers can be found here</a>
    </p>
  </section>
</main>

<style lang="scss">
  main {
    text-align: center;
    overflow-y: visible;
    max-height: calc(100vh - 40px);
    section {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      min-height: 40vh;
      padding: 0 5em;
      &:first-child {
        min-height: calc(100vh - 40px);
      }
      &:last-child {
        margin-bottom: 25vh;
      }
    }
    h1,
    h2,
    h3,
    h4,
    h5,
    h6 {
      margin: 0;
    }
    h6 {
      font-weight: 400;
      color: #888888;
    }
    .tabs {
      p {
        margin: 0;
      }
    }
  }
</style>
