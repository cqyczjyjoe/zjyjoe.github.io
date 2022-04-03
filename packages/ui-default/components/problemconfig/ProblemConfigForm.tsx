import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import i18n from 'vj/utils/i18n';
import { Switch, Tab, Tabs } from '@blueprintjs/core';
import type { RootState } from './reducer/index';
import CustomSelectAutoComplete from '../autocomplete/CustomSelectAutoComplete';

const SelectValue = {
  type: ['default', 'interactive', 'submit_answer', 'objective'],
  checker_type: ['default', 'lemon', 'syzoj', 'hustoj', 'testlib', 'qduoj'],
  task_type: ['min', 'max', 'sum'],
};

function FormItem({
  columns, label, children, helpText = '', disableLabel = false, ...props
}) {
  return (
    <div {...props} className={`${columns && `medium-${columns}`} columns form__item`}>
      <label htmlFor={`${label}-form`}>
        {!disableLabel && i18n(label)}
        {children}
        {helpText && (<p className="help-text">{i18n(helpText)}</p>)}
      </label>
    </div>
  );
}

type KeyType<K, T = string | number> = {
  [Q in keyof K]: K[Q] extends T ? Q : never;
}[keyof K];

function ManagedInput({ placeholder, formKey }: { placeholder: string, formKey: KeyType<RootState['config']> }) {
  const value = useSelector((state: RootState) => state.config[formKey]);
  const dispatch = useDispatch();
  return (
    <input
      placeholder={i18n(placeholder)}
      value={value || ''}
      onChange={(ev) => {
        dispatch({ type: 'CONFIG_FORM_UPDATE', key: formKey, value: ev.currentTarget.value });
      }}
      className="textbox"
    />
  );
}

function ManagedSelect({ placeholder, formKey }: { placeholder: string, formKey: KeyType<RootState['config']> }) {
  const value = useSelector((state: RootState) => state.config[formKey]);
  const dispatch = useDispatch();
  return (
    <select
      placeholder={i18n(placeholder)}
      value={value || ''}
      onChange={(ev) => {
        dispatch({ type: 'CONFIG_FORM_UPDATE', key: formKey, value: ev.currentTarget.value });
      }}
      className="select"
    >
      {SelectValue[formKey].map((i) => (<option value={i} key={i}>{i}</option>))}
    </select>
  );
}

function SingleFileSelect({ formKey }: { formKey: KeyType<RootState['config']> }) {
  const value = useSelector((state: RootState) => state.config[formKey]);
  const Files = useSelector((state: RootState) => state.testdata);
  const dispatch = useDispatch();
  return (
    <CustomSelectAutoComplete
      width="100%"
      data={Files}
      defaultItems={value}
      onChange={(val) => dispatch({ type: 'CONFIG_FORM_UPDATE', key: formKey, value: val })}
    />
  );
}

function BasicInfo() {
  const Type = useSelector((state: RootState) => state.config.type);
  const checkerType = useSelector((state: RootState) => state.config.checker_type);
  const dispatch = useDispatch();
  return (
    <>
      <FormItem columns={6} label="Type">
        <ManagedSelect placeholder="type" formKey="type" />
      </FormItem>
      <FormItem columns={6} label="Filename">
        <ManagedInput placeholder="filename" formKey="filename" />
      </FormItem>
      <FormItem
        columns={12}
        label="CheckerType"
        disableLabel
        style={Type !== 'default' ? { display: 'none' } : {}}
      >
        <Tabs
          id="CheckerTypeTabs"
          selectedTabId={checkerType !== 'strict' ? checkerType : 'default'}
          onChange={(value) => {
            dispatch({ type: 'CONFIG_FORM_UPDATE', key: 'checker_type', value });
          }}
          renderActiveTabPanelOnly
        >
          <span>{i18n('CheckerType')}</span>
          <Tabs.Expander />
          {
            SelectValue.checker_type.map((i) => (
              <Tab
                id={i}
                title={i}
                key={i}
                panel={(
                  <FormItem columns={12} label="Checker">
                    {['default', 'strict'].includes(i)
                      ? (
                        <Switch
                          checked={checkerType === 'strict'}
                          label="Don't ignore space and enter."
                          onChange={
                            () => {
                              dispatch({ type: 'CONFIG_FORM_UPDATE', key: 'checker_type', value: checkerType === 'strict' ? 'default' : 'strict' });
                            }
                          }
                        />
                      )
                      : (
                        <SingleFileSelect formKey="checker" />
                      )}
                  </FormItem>
                )}
              />
            ))
          }
        </Tabs>
      </FormItem>
      <FormItem columns={6} label="Interactor" style={Type !== 'interactive' ? { display: 'none' } : {}}>
        <SingleFileSelect formKey="interactor" />
      </FormItem>
    </>
  );
}

function ExtraFilesConfig() {
  const [showTab, setshowTab] = useState(false);
  const Files = useSelector((state: RootState) => state.testdata);
  const userExtraFiles = useSelector((state: RootState) => state.config.user_extra_files);
  const judgeExtraFiles = useSelector((state: RootState) => state.config.judge_extra_files);
  const dispatch = useDispatch();
  return (
    <FormItem columns={12} label="ExtraFilesTabs" disableLabel>
      <Switch checked={showTab} label="Extra Files Config" onChange={() => setshowTab(!showTab)} />
      <div style={!showTab ? { display: 'none' } : {}}>
        <Tabs id="ExtraFilesTabs">
          <Tab
            id="user_extra_files"
            title="user_extra_files"
            panel={(
              <CustomSelectAutoComplete
                data={Files}
                defaultItems={userExtraFiles}
                onChange={(val) => dispatch({ type: 'CONFIG_FORM_UPDATE', key: 'user_extra_files', value: val.split(',') })}
                multi
              />
            )}
          />
          <Tab
            id="judge_extra_files"
            title="judge_extra_files"
            panel={(
              <CustomSelectAutoComplete
                data={Files}
                defaultItems={judgeExtraFiles}
                onChange={(val) => dispatch({ type: 'CONFIG_FORM_UPDATE', key: 'judge_extra_files', value: val.split(',') })}
                multi
              />
            )}
          />
        </Tabs>
      </div>
    </FormItem>
  );
}

function CasesTable({ index }) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const cases = useSelector((state: RootState) => (index === -1 ? state.config.cases : state.config.subtasks[index].cases));
  const Files = useSelector((state: RootState) => state.testdata);
  const dispatch = useDispatch();
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>
            {i18n('Input')}<br />
            <CustomSelectAutoComplete
              width="100%"
              data={Files}
              defaultItems={input}
              onChange={(val) => setInput(val)}
            />
          </th>
          <th>
            {i18n('Output')}<br />
            <CustomSelectAutoComplete
              width="100%"
              data={Files}
              defaultItems={output}
              onChange={(val) => setOutput(val)}
            />
          </th>
          <th>
            <span className="icon icon-wrench"></span><br />
            <a
              onClick={
                () => dispatch({
                  type: index === -1 ? 'CONFIG_TASK_UPDATE' : 'CONFIG_SUBTASK_UPDATE', id: index, key: 'cases-add', value: { input, output },
                })
              }
            ><span className="icon icon-add">{i18n('Add')}</span>
            </a>
          </th>
        </tr>
      </thead>
      <tbody>
        {cases.map((k, v) => (
          <tr key={JSON.stringify(k)}>
            <td>
              {k.input}
            </td>
            <td>
              {k.output}
            </td>
            <td>
              <a
                onClick={
                  () => {
                    setInput('');
                    setOutput('');
                    dispatch({
                      type: index === -1 ? 'CONFIG_TASK_UPDATE' : 'CONFIG_SUBTASK_UPDATE', id: index, key: 'cases-delete', value: v,
                    });
                  }
                }
              ><span className="icon icon-delete">{i18n('Delete')}</span>
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function SubtasksTable({ data, index }) {
  const subtasks = useSelector((state: RootState) => state.config.subtasks);
  const dispatch = useDispatch();
  return (
    <div key={index}>
      <p>Subtasks #{index}</p>
      <table className="data-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Type</th>
            <th>Score</th>
            <th>Time</th>
            <th>Memory</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <input
                value={data.id}
                onChange={(ev) => {
                  dispatch({
                    type: 'CONFIG_TASK_UPDATE', id: index, key: 'id', value: ev.currentTarget.value,
                  });
                }}
                className="textbox"
              />
            </td>
            <td>
              <input
                value={data.score || ''}
                onChange={(ev) => {
                  dispatch({
                    type: 'CONFIG_TASK_UPDATE', id: index, key: 'score', value: ev.currentTarget.value,
                  });
                }}
                className="textbox"
              />
            </td>
            <td>
              <select
                value={data.type}
                onChange={(ev) => {
                  dispatch({
                    type: 'CONFIG_TASK_UPDATE', id: index, key: 'id', value: ev.currentTarget.value,
                  });
                }}
                className="select"
              >
                <option aria-label="null" value="" style={{ display: 'none' }}></option>
                {SelectValue.task_type.map((i) => (<option value={i} key={i}>{i}</option>))}
              </select>
            </td>
            <td>
              <input
                value={data.time || ''}
                onChange={(ev) => {
                  dispatch({
                    type: 'CONFIG_TASK_UPDATE', id: index, key: 'time', value: ev.currentTarget.value,
                  });
                }}
                className="textbox"
              />
            </td>
            <td>
              <input
                value={data.memory || ''}
                onChange={(ev) => {
                  dispatch({
                    type: 'CONFIG_TASK_UPDATE', id: index, key: 'memory', value: ev.currentTarget.value,
                  });
                }}
                className="textbox"
              />
            </td>
          </tr>
          <tr>
            <td>if</td>
            <td colSpan={4}>
              <CustomSelectAutoComplete
                data={subtasks}
                defaultItems={data.if}
                onChange={(val) => dispatch({
                  type: 'CONFIG_TASK_UPDATE', id: index, key: 'if', value: val.split(','),
                })}
                multi
              />
            </td>
          </tr>
        </tbody>
      </table>
      <CasesTable index={index} />
    </div>
  );
}

function TaskConfig() {
  const subtasks = useSelector((state: RootState) => state.config.subtasks);
  const cases = useSelector((state: RootState) => state.config.cases);
  const dispatch = useDispatch();
  return (
    <FormItem columns={12} label="Task Settings">
      <div className="row">
        <FormItem columns={4} label="Time">
          <ManagedInput placeholder="Time" formKey="time" />
        </FormItem>
        <FormItem columns={4} label="Memory">
          <ManagedInput placeholder="Memory" formKey="memory" />
        </FormItem>
        <FormItem columns={4} label="Score">
          <ManagedInput placeholder="Score" formKey="score" />
        </FormItem>
        <FormItem columns={12} label="Cases Settings" disableLabel>
          {
            subtasks || cases
              ? subtasks && <ul>{subtasks.map((k, v) => <SubtasksTable data={k} index={v} />)}</ul>
                || cases && (<CasesTable index={-1} />)
              : <Switch checked label="Use Auto Cases" onChange={() => dispatch({ type: 'CONFIG_AUTOCASES_UPDATE', value: false })} />
          }
        </FormItem>
      </div>
    </FormItem>
  );
}

function LangConfig() {
  const [showTab, setshowTab] = useState(false);
  const langs = useSelector((state: RootState) => state.config.langs);
  // @ts-ignore
  const data = Object.keys(window.LANGS);
  const dispatch = useDispatch();
  return (
    <FormItem columns={12} label="LangsTabs" disableLabel>
      <Switch checked={showTab} label="Langs Config" onChange={() => setshowTab(!showTab)} />
      <FormItem columns={12} label="langs" style={!showTab ? { display: 'none' } : {}}>
        <CustomSelectAutoComplete
          data={data}
          defaultItems={langs || []}
          onChange={(val) => dispatch({ type: 'CONFIG_FORM_UPDATE', key: 'langs', value: val.split(',') })}
          multi
        />
      </FormItem>
    </FormItem>
  );
}

export default function ProblemConfigForm() {
  return (
    <div className="row">
      <BasicInfo />
      <TaskConfig />
      <ExtraFilesConfig />
      <LangConfig />
    </div>
  );
}
