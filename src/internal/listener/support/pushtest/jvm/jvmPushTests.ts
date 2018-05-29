/*
 * Copyright © 2018 Atomist, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { fileExists } from "@atomist/automation-client/project/util/projectUtils";
import { predicatePushTest, PredicatePushTest } from "../../../../../api/mapping/PushTest";
import { hasFile, hasFileWithExtension } from "../../../../../api/mapping/support/commonPushTests";

/**
 * Is this a Maven project
 * @constructor
 */
export const IsMaven: PredicatePushTest = predicatePushTest(
    "Is Maven",
    async p => !!(await p.getFile("pom.xml")));

export const IsJava = predicatePushTest(
    "Is Java",
    async p =>
        fileExists(p, "**/*.java", () => true));

export const IsClojure = hasFileWithExtension("clj");

export const IsLein = hasFile("project.clj");