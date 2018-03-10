import { SoftwareDeliveryMachine } from "../blueprint/SoftwareDeliveryMachine";
import { GuardedGoalSetter } from "../common/listener/support/GuardedGoalSetter";
import { IsMaven, IsSpringBoot } from "../common/listener/support/jvmGuards";
import { HasK8Spec } from "../common/listener/support/k8sSpecPushTest";
import { MaterialChangeToJavaRepo } from "../common/listener/support/materialChangeToJavaRepo";
import { IsNode } from "../common/listener/support/nodeGuards";
import { PushFromAtomist, PushToDefaultBranch, PushToPublicRepo } from "../common/listener/support/pushTests";
import { not } from "../common/listener/support/pushTestUtils";
import { HttpServiceGoals, LocalDeploymentGoals } from "../handlers/events/delivery/goals/httpServiceGoals";
import { LibraryGoals } from "../handlers/events/delivery/goals/libraryGoals";
import { NpmGoals } from "../handlers/events/delivery/goals/npmGoals";
import { lookFor200OnEndpointRootGet } from "../handlers/events/delivery/verify/common/lookFor200OnEndpointRootGet";
import { artifactStore } from "./blueprint/artifactStore";
import { K8sBuildOnSuccessStatus } from "./blueprint/build/K8sBuildOnScanSuccess";
import {
    K8sProductionDeployOnSuccessStatus,
    K8sStagingDeployOnSuccessStatus,
    NoticeK8sProdDeployCompletion,
    NoticeK8sTestDeployCompletion,
} from "./blueprint/deploy/k8sDeploy";
import { suggestAddingK8sSpec } from "./blueprint/repo/suggestAddingK8sSpec";
import { addK8sSpec } from "./commands/editors/k8s/addK8sSpec";
import { configureSpringSdm } from "./springSdmConfig";

export function k8sSoftwareDeliveryMachine(opts: { useCheckstyle: boolean }): SoftwareDeliveryMachine {
    const sdm = new SoftwareDeliveryMachine(
        {
            builder: K8sBuildOnSuccessStatus,
            deployers: [
                K8sStagingDeployOnSuccessStatus,
                K8sProductionDeployOnSuccessStatus,
            ],
            artifactStore,
        },
        new GuardedGoalSetter(HttpServiceGoals, PushToDefaultBranch, IsMaven, IsSpringBoot,
            HasK8Spec,
            PushToPublicRepo),
        new GuardedGoalSetter(LocalDeploymentGoals, not(PushFromAtomist), IsMaven, IsSpringBoot),
        new GuardedGoalSetter(LibraryGoals, IsMaven, MaterialChangeToJavaRepo),
        new GuardedGoalSetter(NpmGoals, IsNode),
    );
    sdm.addNewRepoWithCodeActions(suggestAddingK8sSpec)
        .addSupportingCommands(() => addK8sSpec)
        .addSupportingEvents(() => NoticeK8sTestDeployCompletion,
            () => NoticeK8sProdDeployCompletion)
        .addEndpointVerificationListeners(
            lookFor200OnEndpointRootGet({
                retries: 15,
                maxTimeout: 5000,
                minTimeout: 3000,
            }),
        );
    configureSpringSdm(sdm, opts);
    return sdm;
}
