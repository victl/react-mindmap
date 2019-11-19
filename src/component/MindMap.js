import React from "react";
import { Model } from "@blink-mind/core";
import { Diagram } from "@blink-mind/renderer-react";
import RichTextEditorPlugin from "@blink-mind/plugin-rich-text-editor";
import { JsonSerializerPlugin } from "@blink-mind/plugin-json-serializer";
import { Toolbar } from "./Toolbar";
import { downloadFile, generateSimpleModel } from "../utils";
import "@blink-mind/renderer-react/lib/main.css";
import debug from "debug";
const log = debug("app");

const plugins = [RichTextEditorPlugin(), JsonSerializerPlugin()];

export class MindMap extends React.Component {
  constructor(props) {
    super(props);
    this.initModel();
  }

  diagram;
  diagramRef = ref => {
    this.diagram = ref;
  };

  initModel() {
    const model = generateSimpleModel();
    this.state = {
      model
    };
  }

  onClickOpenFile = e => {
    const input = document.createElement("input");
    const props = this.diagram.getDiagramProps();
    const { controller } = props;
    input.type = "file";
    input.accept = ".json";
    log("add onchange");
    input.addEventListener("change", evt => {
      const file = evt.target.files[0];
      const fr = new FileReader();
      log("add fr onload");
      fr.onload = evt => {
        const txt = evt.target.result;
        let obj = JSON.parse(txt);
        log("OpenFile:", obj);
        let model = controller.run("deserializeModel", { controller, obj });
        log("OpenFile:", model);
        this.setState({ model });
      };
      fr.readAsText(file);
    });
    input.click();
  };

  onClickExportJson = e => {
    const props = this.diagram.getDiagramProps();
    const { controller } = props;

    const json = controller.run("serializeModel", props);
    const jsonStr = JSON.stringify(json);
    const url = `data:text/plain,${encodeURIComponent(jsonStr)}`;
    downloadFile(url, "example.json");
    this.setState({ showDialog: false });
  };

  renderDiagram() {
    return (
      <Diagram
        ref={this.diagramRef}
        model={this.state.model}
        onChange={this.onChange}
        plugins={plugins}
      />
    );
  }

  renderToolbar() {
    const eventHandlers = {
      onClickExportJson: this.onClickExportJson,
      onClickOpenFile: this.onClickOpenFile
    };
    return <Toolbar {...eventHandlers} />;
  }

  renderDialog() {}

  onChange = model => {
    this.setState({
      model
    });
  };

  render() {
    return (
      <div className="mindmap">
        {this.renderToolbar()}
        {this.renderDiagram()}
      </div>
    );
  }
}

export default MindMap;
