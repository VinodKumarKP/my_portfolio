---
title: "AI Auditor Feedback Loops"
year: 2026
phase: "Proof of Concept"
description: "Designing continuous learning architectures where human-in-the-loop auditor feedback automatically improves AI relevance scoring using both Traditional ML and Agentic RAG paradigms."
tags: ["AWS SageMaker", "Continuous Training", "Vector DB", "RAG", "Human-in-the-Loop"]
---

## The Challenge

In mission-critical environments like CMS (Medicare/Medicaid) commercial auditing, AI systems are deployed to flag erroneous or fraudulent medical claims. However, AI is not perfect. When an AI denies a claim and a human Clinical Auditor reviews it, they may disagree with the AI's decision. 

**The architectural challenge:** How do we seamlessly capture the auditor's "Accept/Reject" signal and use it to automatically retrain or guide the AI so that it never makes the same mistake twice? 

Below are two architectural approaches to solve this, depending on the nature of the AI system.

---

### Approach 1: Traditional ML (Continuous Training)

For predictive anomaly scoring (e.g., an XGBoost model scoring a claim's fraud probability based on structured billing codes), the system relies on a **Continuous Training (CT)** pipeline to mathematically adjust the model's weights.

```mermaid
graph TD
    subgraph Frontend Application
        UI[Auditor UI]
    end

    subgraph Streaming Ingestion
        API[API Gateway]
        Kin[Kinesis Data Firehose]
    end

    subgraph Data Lake & Processing
        S3[(Amazon S3 Data Lake)]
        FS[(SageMaker Feature Store)]
        Glue[AWS Glue\nData Joiner]
    end

    subgraph Automated Retraining
        Pipe[SageMaker Pipeline]
        Model[XGBoost Model]
        Shadow[Shadow Endpoint]
    end

    UI -->|Auditor Clicks Reject| API
    API -->|Feedback Payload| Kin
    Kin -->|Batch Write| S3
    S3 -->|Feedback Labels| Glue
    FS -->|Original Claim Features| Glue
    Glue -->|Ground Truth Dataset| Pipe
    Pipe -->|Retrains| Model
    Model -->|A/B Testing| Shadow

    classDef aws fill:#FF9900,stroke:#232F3E,stroke-width:2px,color:#fff;
    classDef data fill:#0066cc,stroke:#fff,stroke-width:2px,color:#fff;
    classDef ml fill:#28a745,stroke:#fff,stroke-width:2px,color:#fff;
    
    class API,Kin,S3 aws;
    class FS,Glue data;
    class Pipe,Model,Shadow ml;
```

**Implementation Details:**
1. **Event Capture:** When an auditor rejects an AI score, a payload containing the `ClaimID`, `ModelVersion`, and `Label=0` is streamed via Kinesis.
2. **Feature Joining:** A scheduled Glue job joins this new label with the original input features stored in the SageMaker Feature Store.
3. **Automated Pipeline:** A SageMaker Pipeline triggers weekly, retrains the model on the updated Ground Truth dataset, and deploys it to a Shadow Endpoint to ensure precision/recall improvements.

---

### Approach 2: Agentic AI (Dynamic In-Context Learning)

For Generative AI systems (e.g., an LLM Agent reading a 50-page unstructured medical chart and a CMS policy document), continuous retraining of a Foundation Model is prohibitively expensive. Instead, we use **Dynamic In-Context Learning** to give the Agent "memory" of past auditor corrections.

```mermaid
graph TD
    subgraph Audit Process
        Agent[LLM Claim Agent]
        UI[Auditor UI]
    end

    subgraph Feedback Loop
        Trace[LangSmith Traces]
        VDB[(Vector Database)]
    end

    subgraph Future Inference
        FutureClaim[New Claim Request]
        PromptEngine[Prompt Injection]
    end

    Agent -->|Generates Claim Denial| UI
    UI -->|Auditor Rejects & Writes Note| Trace
    Trace -->|Embeds Golden Example| VDB
    
    FutureClaim --> PromptEngine
    PromptEngine -->|Similarity Search| VDB
    VDB -->|Returns Past Corrections| PromptEngine
    PromptEngine -->|Augmented Prompt| Agent

    classDef ai fill:#8a2be2,stroke:#fff,stroke-width:2px,color:#fff;
    classDef ops fill:#0066cc,stroke:#fff,stroke-width:2px,color:#fff;
    
    class Agent,PromptEngine ai;
    class Trace,VDB ops;
```

**Implementation Details:**
1. **Correction Capture:** The auditor rejects the AI's explanation and writes: *"The AI missed the addendum on page 12 stating the patient had a comorbidity."*
2. **Vector Storage:** This correction is embedded and stored in a Vector DB as a "Negative Example".
3. **Dynamic Prompting:** The next time the Agent evaluates a similar claim, it queries the Vector DB and dynamically injects the auditor's past feedback into its system prompt: *"Warning: In a previous audit, you missed comorbidities in the addendums. Ensure you scan all addendums."*

## Business Outcomes
- **Zero-Friction Alignment:** The AI system aligns with clinical auditor reasoning instantly (via Agentic prompts) or continuously (via ML pipelines) without requiring manual data science intervention.
- **Reduced Hallucinations:** By injecting past human corrections directly into the LLM context, the system is prevented from repeating the exact same audit mistakes.
- **Enterprise Governance:** The architecture provides a full audit trail of how and why a model evolved, ensuring compliance with strict healthcare and CMS data governance policies.
