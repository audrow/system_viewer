// Copyright 2021 Open Source Robotics Foundation, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// React
import * as React from 'react';
import { CSSProperties, useEffect, useState } from 'react';

// Fluent UI
import { DefaultButton } from "@fluentui/react";
import { TextField, ITextFieldStyles } from '@fluentui/react/lib/TextField';
import { IRenderFunction } from '@fluentui/utilities';
import { DetailsList, DetailsListLayoutMode, IDetailsHeaderProps, Selection, IColumn } from '@fluentui/react/lib/DetailsList';
import { MarqueeSelection } from '@fluentui/react/lib/MarqueeSelection';
import { mergeStyles } from '@fluentui/react/lib/Styling';

// Foxglove Studio
import Icon from "@foxglove/studio-base/src/components/Icon";

// MDI Icons
// import SelectAllIcon from "@mdi/svg/svg/format-list-bulleted-square.svg";
import {SelectAllOn as SelectAllIcon} from "@emotion-icons/fluentui-system-regular/SelectAllOn";
// import SelectNoneIcon from "@mdi/svg/svg/format-list-checkbox.svg";
import {SelectAllOff as SelectNoneIcon} from "@emotion-icons/fluentui-system-regular/SelectAllOff";

const exampleChildClass = mergeStyles({
  display: 'block',
  marginBottom: '10px',
});

export interface IButtonExampleProps {
  // These are set based on the toggles shown above the examples (not needed in real code)
  disabled?: boolean;
  checked?: boolean;
}

const textFieldStyles: Partial<ITextFieldStyles> = { root: { maxWidth: '300px' } };
const selectNoneStyle: CSSProperties = { paddingLeft: '25px' };

export interface INodeListItem {
  key: number;
  name: string;
}

export interface INodeListState {
  items: INodeListItem[];
  selectionDetails: string;
}

interface Props {
  nodes: any[]
  edges: any[]
}

export class NodeList extends React.Component<Props, INodeListState> {
  private _selection: Selection;
  private _allItems: INodeListItem[];
  private _columns: IColumn[];

  constructor(props: Props) {
    super(props);

    this._selection = new Selection({
      onSelectionChanged: () => this.setState({ selectionDetails: this._getSelectionDetails() }),
    });

    this._allItems = [];
    for (let i = 0; i < props.nodes.length; i++) {
      if (props.nodes[i]) {
        if (props.nodes[i]!.data) {
          const name = props.nodes[i]!.data.label
          this._allItems.push({ key: i, name: name, })
        }
      }
    }

    this._allItems.sort(function (a, b) {
      if (a.name < b.name) { return -1; }
      if (a.name > b.name) { return 1; }
      return 0;
    })

    this._columns = [
      { key: 'column1', name: 'Name', fieldName: 'name', minWidth: 200, maxWidth: 200, isResizable: true },
    ];

    this.state = {
      items: this._allItems,
      selectionDetails: this._getSelectionDetails(),
    };
  }

  private onRenderDetailsHeader: IRenderFunction<IDetailsHeaderProps> = (props, defaultRender) => {
    if (!props) {
      return null;
    }

    const [selectionDetails, setSelectionDetails] = useState({})
    const [selection, setSelection] = useState(new Selection({
      onSelectionChanged: () => setSelectionDetails(this._getSelectionDetails())
    }))

    useEffect(() => {
      setSelection(new Selection({
        onSelectionChanged: () => setSelectionDetails(this._getSelectionDetails())
      }))
    }, [selectionDetails])

    return (
      <div>
        <TextField
          className={exampleChildClass}
          label="Filter by name:"
          onChange={this._onFilter}
          styles={textFieldStyles}
        />
        <br />

        <DefaultButton text="Select All"
          styles={{
            flexContainer: {
              flexDirection: 'row-reverse'
            }
          }}
          onClick={
            () => {
              const newSelection = this._selection;
              newSelection.setItems(this._allItems);
              for (let i = 0; i <= this._allItems.length; i++) {
                newSelection.setKeySelected(`${i}`, true, false);
              }
              setSelection(newSelection);
              setSelectionDetails(this._getSelectionDetails());
            }
          }
        >
          <Icon style={{ color: "white" }} size="medium">
            <SelectAllIcon />
          </Icon>
        </DefaultButton>

        <span style={selectNoneStyle}>
          <DefaultButton text="Select None"
            styles={{
              flexContainer: {
                flexDirection: 'row-reverse',
              }
            }}
            onClick={
              () => {
                const newSelection = this._selection;
                newSelection.setItems(this._allItems);
                for (let i = 0; i <= this._allItems.length; i++) {
                  newSelection.setKeySelected(`${i}`, false, false);
                }
                setSelection(newSelection);
                setSelectionDetails(this._getSelectionDetails());
              }
            }
          >
            <Icon style={{ color: "white" }} size="medium">
              <SelectNoneIcon />
            </Icon>
          </DefaultButton>
        </span>
        <br />
        <br />
      </div>
    );
  }

  public override render(): JSX.Element {
    const { items, selectionDetails } = this.state;

    return (
      <div>
        <MarqueeSelection selection={this._selection}>
          <DetailsList
            compact={false}
            items={items}
            columns={this._columns}
            setKey="set"
            layoutMode={DetailsListLayoutMode.justified}
            selection={this._selection}
            selectionPreservedOnEmptyClick={true}
            onItemInvoked={this._onItemInvoked}
            onRenderDetailsHeader={this.onRenderDetailsHeader}
            ariaLabelForSelectionColumn="Toggle selection"
            ariaLabelForSelectAllCheckbox="Toggle selection for all items"
            checkButtonAriaLabel="select row"
          />
        </MarqueeSelection>
      </div>
    );
  }

  private _getSelectionDetails(): string {
    const selectionCount = this._selection.getSelectedCount();

    switch (selectionCount) {
      case 0:
        return 'No items selected';
      case 1:
        return '1 item selected: ' + (this._selection.getSelection()[0] as INodeListItem).name;
      default:
        return `${selectionCount} items selected`;
    }
  }

  private _onFilter = (ev: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, text: string | undefined): void => {
    this.setState({
      items: text ? this._allItems.filter(i => i.name.toLowerCase().indexOf(text) > -1) : this._allItems,
    });
  };

  private _onItemInvoked(item: INodeListItem): void {
    alert(`Item invoked: ${item.name}`);
  }
}
