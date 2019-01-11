import { saveAs } from "browser-filesaver";
import * as React from "react";

import { AccountClient } from "../../Account/AccountClient";
import { Button } from "../../Components/Button";
import { env } from "../../Environment";
import { Store } from "../../Utility/Store";
import { AccountViewModel } from "../AccountViewModel";

interface AccountSyncSettingsProps {
  accountViewModel: AccountViewModel;
  accountClient: AccountClient;
}

interface AccountSyncSettingsState {
  syncError: string;
}

class AccountSyncSettings extends React.Component<
  AccountSyncSettingsProps,
  AccountSyncSettingsState
> {
  constructor(props) {
    super(props);
    this.state = {
      syncError: ""
    };
  }

  public render() {
    if (!env.IsLoggedIn) {
      return (
        <React.Fragment>
          <p>
            Log in with Patreon to access patron benefits. Account Sync allows
            you to access your custom statblocks and encounters from anywhere!
          </p>
          <a className="login button" href={env.PatreonLoginUrl}>
            Log In with Patreon
          </a>
        </React.Fragment>
      );
    }

    if (!env.HasStorage) {
      return (
        <React.Fragment>
          <p>
            You're logged in with Patreon, but you have not selected the
            <a
              href="https://www.patreon.com/bePatron?c=716070&rid=1322253"
              target="_blank"
            >
              Account Sync
            </a>
            reward level.
          </p>
          <a className="button logout" href="/logout">
            Log Out
          </a>
        </React.Fragment>
      );
    }

    return (
      <React.Fragment>
        <h3>Account Sync</h3>
        <p>Account Sync is enabled.</p>
        <ul>
          <li>Creatures: {this.props.accountViewModel.SyncedCreatures()}</li>
          <li>Characters: {this.props.accountViewModel.SyncedCharacters()}</li>
          <li>Spells: {this.props.accountViewModel.SyncedSpells()}</li>
          <li>Encounters: {this.props.accountViewModel.SyncedEncounters()}</li>
        </ul>
        <Button text="Backup and Sync local data" onClick={this.syncAll} />
        {this.state.syncError && <pre>{this.state.syncError}</pre>}
        <a className="button logout" href="/logout">
          Log Out
        </a>
      </React.Fragment>
    );
  }

  private syncAll = () => {
    this.setState({ syncError: "" });
    let blob = Store.ExportAll();
    saveAs(blob, "improved-initiative.json");
    this.props.accountClient.SaveAll(
      this.props.accountViewModel.Libraries,
      progressMessage => {
        this.setState({
          syncError:
            this.state.syncError + "\n" + JSON.stringify(progressMessage)
        });
      }
    );
  };
}

interface LocalDataSettingsProps {}
class LocalDataSettings extends React.Component<LocalDataSettingsProps> {
  public render() {
    return (
      <React.Fragment>
        <h3>Local Data</h3>
        <p>
          Export your user data as JSON:
          <Button text="Download File" onClick={this.exportData} />
        </p>
        <p>
          Import an exported user data file:
          <input type="file" accept=".json" onChange={this.importData} />
        </p>
        <p>
          Import statblocks and spells from DnDAppFile:
          <input type="file" accept=".xml" onChange={this.importDndAppFile} />
        </p>
      </React.Fragment>
    );
  }

  private exportData = () => {
    let blob = Store.ExportAll();
    saveAs(blob, "improved-initiative.json");
  };

  private importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files[0];
    if (file) {
      Store.ImportAll(file);
    }
  };

  private importDndAppFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    let file = event.target.files[0];
    if (file) {
      Store.ImportFromDnDAppFile(file);
    }
  };
}

interface AccountSettingsProps {
  accountViewModel: AccountViewModel;
  accountClient: AccountClient;
}
export class AccountSettings extends React.Component<AccountSettingsProps> {
  public render() {
    return (
      <React.Fragment>
        <LocalDataSettings />
        <AccountSyncSettings
          accountClient={this.props.accountClient}
          accountViewModel={this.props.accountViewModel}
        />
      </React.Fragment>
    );
  }
}
