import { Dialog, Listbox, Transition } from "@headlessui/react";
import {
  ArchiveBoxIcon,
  ArrowRightCircleIcon,
  ChevronDownIcon,
  DocumentDuplicateIcon,
  HeartIcon,
  TrashIcon,
  UserPlusIcon,
  GlobeAltIcon,
  CodeBracketSquareIcon,
  CursorArrowRippleIcon,
} from "@heroicons/react/20/solid";
import {
  LinkIcon,
  PencilSquareIcon,
  QuestionMarkCircleIcon,
} from "@heroicons/react/24/outline";
import { XMarkIcon } from "@heroicons/react/24/solid";
import React, { Fragment, useRef, useState } from "react";
import { classNames } from "../../lib/utils";
import FloatingLabelInput from "../floatingLabelInput";
import { Database } from "../../lib/database.types";
import Modal from "../modal";
import { Action } from "../../lib/types";
import { SelectBoxOption } from "../selectBox";
import SelectBox from "../selectBox";

const allActionTypes: SelectBoxOption[] = [
  {
    id: null,
    name: "Select an action type",
    icon: (
      <ChevronDownIcon
        className="ml-2 mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
    ),
  },
  {
    id: "http",
    name: "HTTP request",
    icon: (
      <GlobeAltIcon
        className="ml-2 mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
    ),
  },
  {
    id: "callback",
    name: "Trigger a callback (coming soon)",
    icon: (
      <CodeBracketSquareIcon
        className="ml-2 mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
    ),
  },
  {
    id: "link",
    name: "Open a link (coming soon)",
    icon: (
      <LinkIcon
        className="ml-2 mr-3 h-6 w-6 text-gray-400 group-hover:text-gray-500"
        aria-hidden="true"
      />
    ),
  },
];

const allRequestMethods: SelectBoxOption[] = [
  {
    id: null,
    name: "Select a request method",
  },
  {
    id: "get",
    name: "GET",
  },
  {
    id: "post",
    name: "POST",
  },
  {
    id: "put",
    name: "PUT",
  },
  {
    id: "delete",
    name: "DELETE",
  },
];
export default function EditActionModal(props: {
  action: Action;
  close: () => void;
  setAction: (action: Action) => void;
}) {
  const saveRef = useRef(null);
  const [invalid, setInvalid] = React.useState<boolean | null>(null);
  const [localAction, setLocalAction] = React.useState<Action>(props.action);

  return (
    <Modal open={!!props.action} setOpen={props.close} classNames={"max-w-4xl"}>
      <div className="flex flex-row justify-between">
        <div className="flex flex-row place-items-center gap-x-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100">
            <PencilSquareIcon
              className="h-6 w-6 text-sky-600"
              aria-hidden="true"
            />
          </div>
          <Dialog.Title as="h3" className="text-xl leading-6 text-gray-100">
            Edit Action
          </Dialog.Title>
        </div>
      </div>

      <div className="mt-10 mb-4 grid grid-cols-2 gap-x-6">
        <div className="relative">
          {localAction.name.length > 30 && (
            <div
              className={classNames(
                "absolute top-4 text-xs -right-10 z-10",
                localAction.name.length === 40
                  ? "text-red-500"
                  : "text-gray-500"
              )}
            >
              {localAction.name.length}/40
            </div>
          )}
          <div className="absolute top-3 right-3 z-10">
            <QuestionMarkCircleIcon className="peer h-6 w-6 text-gray-400 hover:text-gray-500 transition rounded-full hover:bg-gray-50" />
            <div className={classNames("-top-8 left-12 w-64 popup")}>
              The AI uses this to write this 1-click reply - be descriptive.
              E.g.
            </div>
          </div>
          <FloatingLabelInput
            className={classNames(
              "px-4 text-gray-900 border-gray-200 border focus:border-sky-500 focus:ring-sky-500 focus:ring-1 ",
              invalid && localAction.name === ""
                ? "ring-2 ring-offset-1 ring-red-500"
                : ""
            )}
            floatingClassName={
              invalid && localAction.name === ""
                ? "text-red-500 peer-focus:text-gray-400"
                : ""
            }
            label={"Name"}
            value={localAction.name ?? ""}
            onChange={(e) => {
              setLocalAction({
                ...localAction,
                name: e.target.value.slice(0, 40),
              });
            }}
          />
          {invalid && localAction.name === "" && (
            <div className="text-red-600 w-full text-center">
              Please enter a name.
            </div>
          )}
        </div>
        <SelectBox
          options={allActionTypes}
          theme={"light"}
          selected={localAction.action_type}
          setSelected={(actionType) => {
            setLocalAction({
              ...localAction,
              action_type: actionType,
            });
          }}
          size={"base"}
        />
      </div>
      <div className="w-full relative mt-3">
        <textarea
          className="w-full bg-gray-50 peer resize-none overflow-y-clip text-gray-800 pl-4 pr-10 pt-4 pb-2 rounded border-gray-200 focus:border-sky-500 focus:ring-sky-500 whitespace-pre-line outline-0"
          value={localAction.description ? localAction.description : ""}
          onChange={(e) => {
            setLocalAction({
              ...localAction,
              description: e.target.value.slice(0, 300),
            });
          }}
          rows={Math.max(Math.ceil(localAction.description.length / 90), 2)}
        />
        {localAction.description && localAction.description.length > 250 && (
          <div
            className={classNames(
              "absolute bottom-2 text-xs right-3 z-10",
              localAction.description.length >= 290
                ? "text-red-500"
                : "text-gray-500"
            )}
          >
            {localAction.description.length}/300
          </div>
        )}
        <div className="absolute top-3 right-3">
          <QuestionMarkCircleIcon className="peer h-6 w-6 text-gray-400 hover:text-gray-500 transition rounded-full" />
          <div className={classNames("right-0 -top-36 w-64 popup")}>
            Give instructions & information to the AI writing the reply.
            <br />
            <br />
            E.g. &ldquo;Book a call, my calendar link is:
            https://calendly.com/...&rdquo;
          </div>
        </div>
        <div
          className={classNames(
            "absolute pointer-events-none left-4 top-3 peer-focus:scale-75 peer-focus:-translate-y-5/8 text-gray-400 select-none transition duration-300",
            localAction.description
              ? "-translate-x-1/8 -translate-y-5/8 scale-75"
              : "peer-focus:-translate-x-1/8"
          )}
        >
          Description
        </div>
      </div>

      {/* DIVIDER*/}
      <div className={"h-px w-full bg-gray-300 my-4"} />

      <div className="my-4 flex flex-col gap-y-4">
        {/* PATH */}
        <div className="w-full px-32 flex flex-row justify-center place-items-center">
          <div className="font-bold text-lg text-gray-100 w-40">Path:</div>
          <div className="w-full flex-1">
            <input
              className={classNames(
                "px-4 text-gray-900 border-gray-200 border focus:border-sky-500 focus:ring-sky-500 focus:ring-1 w-full py-2.5 rounded outline-0",
                invalid && localAction.path === ""
                  ? "ring-2 ring-offset-1 ring-red-500"
                  : ""
              )}
              value={localAction.path ?? ""}
              onChange={(e) => {
                setLocalAction({
                  ...localAction,
                  path: e.target.value,
                });
              }}
            />
            {invalid && localAction.path === "" && (
              <div className="text-red-600 w-full text-center">
                Please enter a valid path (absolute or relative).
              </div>
            )}
          </div>
        </div>
        {/* METHOD */}
        <div className="w-full px-32 flex flex-row justify-center place-items-center">
          <div className="font-bold text-lg text-gray-100 w-40">Method:</div>
          <SelectBox
            options={allRequestMethods}
            theme={"light"}
            selected={localAction.request_method}
            setSelected={(requestMethod) => {
              setLocalAction({
                ...localAction,
                request_method: requestMethod,
              });
            }}
            size={"base"}
          />
        </div>
        {/* PARAMETERS */}
        <div className="w-full px-32 flex flex-row justify-center place-items-center">
          <div className="font-bold text-lg text-gray-100 w-40">
            Parameters:
          </div>
          <div className="border border-gray-700 flex-1 px-4 py-3 font-mono text-sm bg-gray-850 rounded whitespace-pre-wrap text-gray-300">
            {JSON.stringify(localAction.parameters, null, 2) ?? "{}"}
          </div>
        </div>
        {/* REQUEST_BODY_CONTENTS */}
        <div className="w-full px-32 flex flex-row justify-center place-items-center">
          <div className="font-bold text-lg text-gray-100 w-40">
            Body Contents:
          </div>
          <div className="border border-gray-700 flex-1 px-4 py-3 font-mono text-sm bg-gray-850 rounded whitespace-pre-wrap text-gray-300">
            {JSON.stringify(localAction.request_body_contents, null, 2) ?? "{}"}
          </div>
        </div>
        {/* RESPONSES */}
        <div className="w-full px-32 flex flex-row justify-center place-items-center">
          <div className="font-bold text-lg text-gray-100 w-40">Responses:</div>
          <div className="border border-gray-700 flex-1 px-4 py-3 font-mono text-sm bg-gray-850 rounded whitespace-pre-wrap text-gray-300">
            {JSON.stringify(localAction.responses ?? {}, null, 2)}
          </div>
        </div>
      </div>

      <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
        <button
          ref={saveRef}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-sky-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-sky-500 sm:order-3 focus:ring-offset-2 sm:text-sm"
          onClick={(event) => {
            event.preventDefault();
            if (localAction.name !== "") {
              props.setAction(localAction);
              props.close();
            } else setInvalid(true);
          }}
        >
          Save
        </button>
        <button
          className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 sm:mt-0 sm:text-sm"
          onClick={props.close}
        >
          Cancel
        </button>
      </div>
    </Modal>
  );
}